import Array "mo:core/Array";
import Set "mo:core/Set";
import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Option "mo:core/Option";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Storage "blob-storage/Storage";


import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";

// Apply migration logic on upgrade

actor {
  public type Media = {
    id : Text;
    blob : Storage.ExternalBlob;
    type_ : {
      #image;
      #video;
      #audio;
    };
    title : Text;
    description : Text;
  };

  public type UserDirectoryProfile = {
    id : Text;
    displayName : Text;
    bio : Text;
    avatarBlob : ?Storage.ExternalBlob;
    coverPhotoBlob : ?Storage.ExternalBlob;
    joinedDate : Time.Time;
  };

  public type UserProfile = {
    id : Text;
    displayName : Text;
    bio : Text;
    avatarBlob : ?Storage.ExternalBlob;
    coverPhotoBlob : ?Storage.ExternalBlob;
    joinedDate : Time.Time;
  };

  public type UserSettings = {
    displayName : Text;
    privacyPostsVisibleToFriendsOnly : Bool;
  };

  public type FriendRequest = {
    from : Principal;
    to : Principal;
    timestamp : Time.Time;
  };

  public type Post = {
    id : Text;
    author : Principal;
    content : Text;
    media : ?Storage.ExternalBlob;
    timestamp : Time.Time;
    isPinned : Bool;
  };

  public type Comment = {
    id : Text;
    postId : Text;
    postAuthor : Principal;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  public type Reaction = {
    user : Principal;
    reactionType : Text;
    timestamp : Time.Time;
  };

  public type Notification = {
    id : Text;
    recipient : Principal;
    notificationType : {
      #friendRequest : { from : Principal };
      #comment : { postId : Text; commentAuthor : Principal };
    };
    timestamp : Time.Time;
    isRead : Bool;
  };

  public type FollowStats = {
    followers : Nat;
    following : Nat;
  };

  module Post {
    public func compareByTimestamp(post1 : Post, post2 : Post) : Order.Order {
      if (post1.timestamp > post2.timestamp) { #less } else if (post1.timestamp < post2.timestamp) {
        #greater;
      } else { #equal };
    };
  };

  module Comment {
    public func compareByTimestamp(comment1 : Comment, comment2 : Comment) : Order.Order {
      if (comment1.timestamp > comment2.timestamp) { #less } else if (comment1.timestamp < comment2.timestamp) {
        #greater;
      } else { #equal };
    };
  };

  module Notification {
    public func compareByTimestamp(notif1 : Notification, notif2 : Notification) : Order.Order {
      if (notif1.timestamp > notif2.timestamp) { #less } else if (notif2.timestamp < notif1.timestamp) {
        #greater;
      } else { #equal };
    };
  };

  // Persistent maps for friends, friend requests, posts, and profiles
  let friendshipsMap = Map.empty<Principal, Set.Set<Principal>>();
  let followingMap = Map.empty<Principal, Set.Set<Principal>>(); // Persistent map for following relationships
  let postsMap = Map.empty<Principal, List.List<Post>>();
  let outgoingRequestsMap = Map.empty<Principal, Set.Set<Principal>>();
  let incomingRequestsMap = Map.empty<Principal, Set.Set<Principal>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userSettings = Map.empty<Principal, UserSettings>();
  let commentsMap = Map.empty<Text, List.List<Comment>>();
  let reactionsMap = Map.empty<Text, List.List<Reaction>>();
  let notificationsMap = Map.empty<Principal, List.List<Notification>>();
  let allPostsMap = Map.empty<Text, Post>();

  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func generateId() : Text {
    Time.now().toText();
  };

  // Follow system
  public shared ({ caller }) func followUser(target : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };
    if (caller == target) { Runtime.trap("Cannot follow yourself") };

    let callerFollowing = switch (followingMap.get(caller)) {
      case (?existing) { existing };
      case (null) { Set.empty<Principal>() };
    };

    if (callerFollowing.contains(target)) { return };

    callerFollowing.add(target);
    followingMap.add(caller, callerFollowing);
  };

  public shared ({ caller }) func unfollowUser(target : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };

    switch (followingMap.get(caller)) {
      case (?following) {
        if (following.contains(target)) {
          following.remove(target);
          followingMap.add(caller, following);
        };
      };
      case (null) {};
    };
  };

  public query ({ caller }) func getFollowStats(user : Principal) : async FollowStats {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view follow statistics");
    };
    let followers = calcFollowers(user);
    let following = calcFollowing(user);
    {
      followers;
      following;
    };
  };

  // --- User Profiles ---

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func searchUserProfiles(searchText : Text) : async [UserDirectoryProfile] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can search profiles");
    };
    let filteredUsers = List.empty<UserDirectoryProfile>();
    for ((principal, profile) in userProfiles.entries()) {
      if (profile.displayName.contains(#text searchText)) {
        let directoryProfile : UserDirectoryProfile = {
          id = profile.id;
          displayName = profile.displayName;
          bio = profile.bio;
          avatarBlob = profile.avatarBlob;
          coverPhotoBlob = profile.coverPhotoBlob;
          joinedDate = profile.joinedDate;
        };
        filteredUsers.add(directoryProfile);
      };
    };
    filteredUsers.toArray();
  };

  public query ({ caller }) func isFollowing(target : Principal) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can check follow status");
    };
    switch (followingMap.get(caller)) {
      case (?following) { following.contains(target) };
      case (null) { false };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save their profile. Anonymous principal is not a user. Please sign in.");
    };
    userProfiles.add(caller, profile);
  };

  // --- Settings Management ---
  public query ({ caller }) func getCallerSettings() : async ?UserSettings {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access their settings");
    };
    userSettings.get(caller);
  };

  public shared ({ caller }) func saveCallerSettings(settings : UserSettings) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save their settings");
    };
    userSettings.add(caller, settings);
  };

  // --- Friend Request System ---
  public shared ({ caller }) func sendFriendRequest(target : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can send friend requests");
    };
    if (caller == target) { Runtime.trap("Cannot send friend request to yourself") };
    if (hasFriendInternal(caller, target)) { Runtime.trap("Already friends") };
    if (hasOutgoingRequest(caller, target)) { Runtime.trap("Friend request already sent") };

    let request : FriendRequest = {
      from = caller;
      to = target;
      timestamp = Time.now();
    };

    let outgoingRequests = switch (outgoingRequestsMap.get(caller)) {
      case (?existing) { existing };
      case (null) { Set.empty<Principal>() };
    };
    outgoingRequests.add(target);
    outgoingRequestsMap.add(caller, outgoingRequests);

    let incomingRequests = switch (incomingRequestsMap.get(target)) {
      case (?existing) { existing };
      case (null) { Set.empty<Principal>() };
    };
    incomingRequests.add(caller);
    incomingRequestsMap.add(target, incomingRequests);

    // Create notification for target
    createNotification(target, #friendRequest({ from = caller }));
  };

  public shared ({ caller }) func acceptFriendRequest(other : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can accept friend requests");
    };
    if (not hasIncomingRequest(caller, other)) { Runtime.trap("No friend request from this user") };

    // Add to caller's friends list
    let callerFriends = switch (friendshipsMap.get(caller)) {
      case (?existing) { existing };
      case (null) { Set.empty<Principal>() };
    };
    callerFriends.add(other);
    friendshipsMap.add(caller, callerFriends);

    // Add to other's friends list
    let otherFriends = switch (friendshipsMap.get(other)) {
      case (?existing) { existing };
      case (null) { Set.empty<Principal>() };
    };
    otherFriends.add(caller);
    friendshipsMap.add(other, otherFriends);

    // Remove friend requests
    removeOutgoingRequest(other, caller);
    removeIncomingRequest(caller, other);
  };

  public shared ({ caller }) func declineFriendRequest(other : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can decline friend requests");
    };
    if (not hasIncomingRequest(caller, other)) { Runtime.trap("No friend request from this user") };
    removeIncomingRequest(caller, other);
    removeOutgoingRequest(other, caller);
  };

  public shared ({ caller }) func cancelFriendRequest(target : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can cancel friend requests");
    };
    if (not hasOutgoingRequest(caller, target)) { Runtime.trap("No outgoing friend request") };
    removeOutgoingRequest(caller, target);
    removeIncomingRequest(target, caller);
  };

  public query ({ caller }) func getFriends(user : Principal) : async [Principal] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view friends lists");
    };
    if (caller != user and not hasFriendInternal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own friends list or your friends' friends lists");
    };
    switch (friendshipsMap.get(user)) {
      case (?friends) { friends.toArray() };
      case (null) { [] };
    };
  };

  public query ({ caller }) func hasFriend(user1 : Principal, user2 : Principal) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can check friendship status");
    };
    let callerIsFriendWithUser1 = hasFriendInternal(caller, user1);
    let callerIsFriendWithUser2 = hasFriendInternal(caller, user2);
    let callerIsOneOfTheUsers = (caller == user1 or caller == user2);

    if (not callerIsOneOfTheUsers and not (callerIsFriendWithUser1 and callerIsFriendWithUser2) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check friendship status for yourself or between your friends");
    };
    hasFriendInternal(user1, user2);
  };

  func hasFriendInternal(user1 : Principal, user2 : Principal) : Bool {
    switch (friendshipsMap.get(user1)) {
      case (?friends) { friends.contains(user2) };
      case (null) { false };
    };
  };

  func hasOutgoingRequest(from : Principal, to : Principal) : Bool {
    switch (outgoingRequestsMap.get(from)) {
      case (?requests) { requests.contains(to) };
      case (null) { false };
    };
  };

  func hasIncomingRequest(to : Principal, from : Principal) : Bool {
    switch (incomingRequestsMap.get(to)) {
      case (?requests) { requests.contains(from) };
      case (null) { false };
    };
  };

  func removeOutgoingRequest(from : Principal, to : Principal) {
    switch (outgoingRequestsMap.get(from)) {
      case (?requests) {
        requests.remove(to);
        outgoingRequestsMap.add(from, requests);
      };
      case (null) {};
    };
  };

  func removeIncomingRequest(to : Principal, from : Principal) {
    switch (incomingRequestsMap.get(to)) {
      case (?requests) {
        requests.remove(from);
        incomingRequestsMap.add(to, requests);
      };
      case (null) {};
    };
  };

  // --- Posts ---
  var isValidBlob : Bool = true;

  public shared ({ caller }) func createPost(content : Text, media : ?Storage.ExternalBlob) : async Post {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };
    let postId = generateId();
    let post : Post = {
      id = postId;
      author = caller;
      content;
      media;
      timestamp = Time.now();
      isPinned = false;
    };

    let existingPosts = switch (postsMap.get(caller)) {
      case (?posts) { posts };
      case (null) {
        List.empty<Post>();
      };
    };

    existingPosts.add(post);
    postsMap.add(caller, existingPosts);
    allPostsMap.add(postId, post);

    post;
  };

  public shared ({ caller }) func updatePost(postId : Text, content : Text, media : ?Storage.ExternalBlob) : async Post {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update posts");
    };

    let existingPost = switch (allPostsMap.get(postId)) {
      case (?post) { post };
      case (null) { Runtime.trap("Post not found") };
    };

    if (existingPost.author != caller) {
      Runtime.trap("Unauthorized: Can only update your own posts");
    };

    let updatedPost : Post = {
      id = postId;
      author = caller;
      content;
      media;
      timestamp = existingPost.timestamp;
      isPinned = existingPost.isPinned;
    };

    // Update in user's posts list
    let userPosts = switch (postsMap.get(caller)) {
      case (?posts) { posts };
      case (null) { Runtime.trap("User posts not found") };
    };

    let updatedPosts = List.empty<Post>();
    for (post in userPosts.values()) {
      if (post.id == postId) {
        updatedPosts.add(updatedPost);
      } else {
        updatedPosts.add(post);
      };
    };

    postsMap.add(caller, updatedPosts);
    allPostsMap.add(postId, updatedPost);

    updatedPost;
  };

  public shared ({ caller }) func deletePost(postId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete posts");
    };

    let existingPost = switch (allPostsMap.get(postId)) {
      case (?post) { post };
      case (null) { Runtime.trap("Post not found") };
    };

    if (existingPost.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own posts");
    };

    // Remove from user's posts list
    let userPosts = switch (postsMap.get(existingPost.author)) {
      case (?posts) { posts };
      case (null) { Runtime.trap("User posts not found") };
    };

    let filteredPosts = List.empty<Post>();
    for (post in userPosts.values()) {
      if (post.id != postId) {
        filteredPosts.add(post);
      };
    };

    postsMap.add(existingPost.author, filteredPosts);
    allPostsMap.remove(postId);

    // Clean up comments and reactions
    commentsMap.remove(postId);
    reactionsMap.remove(postId);
  };

  public query ({ caller }) func getPostsForUser(user : Principal) : async [Post] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };

    // Check privacy settings
    let settings = switch (userSettings.get(user)) {
      case (?s) { s };
      case (null) { { displayName = ""; privacyPostsVisibleToFriendsOnly = false } };
    };

    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      if (settings.privacyPostsVisibleToFriendsOnly and not hasFriendInternal(caller, user)) {
        Runtime.trap("Unauthorized: This user's posts are only visible to friends");
      };
    };

    let postArray = switch (postsMap.get(user)) {
      case (?posts) {
        posts.toArray();
      };
      case (null) { [] };
    };

    postArray.sort(Post.compareByTimestamp);
  };

  public query ({ caller }) func getTimeline() : async [Post] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view timeline");
    };
    var allPosts = List.empty<Post>();

    // Add caller's posts
    allPosts.addAll((switch (postsMap.get(caller)) {
      case (?posts) { posts };
      case (null) {
        List.empty<Post>();
      };
    }).values());

    let friendsArray = switch (friendshipsMap.get(caller)) {
      case (?friends) { friends.toArray() };
      case (null) { [] };
    };

    for (friend in friendsArray.values()) {
      allPosts.addAll(((switch (postsMap.get(friend)) {
        case (?posts) { posts };
        case (null) {
          List.empty<Post>();
        };
      })).values());
    };

    allPosts.toArray().sort(Post.compareByTimestamp);
  };

  // --- Pin Post ---
  public shared ({ caller }) func pinPost(postId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can pin posts");
    };

    let post = switch (allPostsMap.get(postId)) {
      case (?p) { p };
      case (null) { Runtime.trap("Post not found") };
    };

    if (post.author != caller) {
      Runtime.trap("Unauthorized: Can only pin your own posts");
    };

    // Get user's posts
    let userPosts = switch (postsMap.get(caller)) {
      case (?posts) { posts };
      case (null) { Runtime.trap("User posts not found") };
    };

    // Unpin any existing pinned post and update allPostsMap
    let updatedPosts = List.empty<Post>();
    for (p in userPosts.values()) {
      if (p.isPinned) {
        let unpinnedPost = { p with isPinned = false };
        updatedPosts.add(unpinnedPost);
        allPostsMap.add(p.id, unpinnedPost);
      } else {
        updatedPosts.add(p);
      };
    };

    // Pin the selected post
    let finalPosts = List.empty<Post>();
    for (p in updatedPosts.values()) {
      if (p.id == postId) {
        let pinnedPost = { p with isPinned = true };
        finalPosts.add(pinnedPost);
        allPostsMap.add(postId, pinnedPost);
      } else {
        finalPosts.add(p);
      };
    };

    postsMap.add(caller, finalPosts);
  };

  // --- Comments ---
  public shared ({ caller }) func addComment(postId : Text, content : Text) : async Comment {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    let post = switch (allPostsMap.get(postId)) {
      case (?p) { p };
      case (null) { Runtime.trap("Post not found") };
    };

    // Check if caller can view the post (respecting privacy settings)
    let postAuthorSettings = switch (userSettings.get(post.author)) {
      case (?s) { s };
      case (null) { { displayName = ""; privacyPostsVisibleToFriendsOnly = false } };
    };

    if (caller != post.author and not AccessControl.isAdmin(accessControlState, caller)) {
      if (postAuthorSettings.privacyPostsVisibleToFriendsOnly and not hasFriendInternal(caller, post.author)) {
        Runtime.trap("Unauthorized: Cannot comment on this post");
      };
    };

    let commentId = generateId();
    let comment : Comment = {
      id = commentId;
      postId;
      postAuthor = post.author;
      author = caller;
      content;
      timestamp = Time.now();
    };

    let existingComments = switch (commentsMap.get(postId)) {
      case (?comments) { comments };
      case (null) { List.empty<Comment>() };
    };

    existingComments.add(comment);
    commentsMap.add(postId, existingComments);

    // Create notification for post author
    if (post.author != caller) {
      createNotification(post.author, #comment({ postId; commentAuthor = caller }));
    };

    comment;
  };

  public shared ({ caller }) func deleteComment(commentId : Text, postId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete comments");
    };

    let comments = switch (commentsMap.get(postId)) {
      case (?c) { c };
      case (null) { Runtime.trap("Post not found") };
    };

    var commentToDelete : ?Comment = null;
    for (comment in comments.values()) {
      if (comment.id == commentId) {
        commentToDelete := ?comment;
      };
    };

    let comment = switch (commentToDelete) {
      case (?c) { c };
      case (null) { Runtime.trap("Comment not found") };
    };

    if (comment.author != caller and comment.postAuthor != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own comments or comments on your posts");
    };

    let filteredComments = List.empty<Comment>();
    for (c in comments.values()) {
      if (c.id != commentId) {
        filteredComments.add(c);
      };
    };

    commentsMap.add(postId, filteredComments);
  };

  public query ({ caller }) func getCommentsForPost(postId : Text) : async [Comment] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view comments");
    };

    let post = switch (allPostsMap.get(postId)) {
      case (?p) { p };
      case (null) { Runtime.trap("Post not found") };
    };

    // Check if caller can view the post
    let postAuthorSettings = switch (userSettings.get(post.author)) {
      case (?s) { s };
      case (null) { { displayName = ""; privacyPostsVisibleToFriendsOnly = false } };
    };

    if (caller != post.author and not AccessControl.isAdmin(accessControlState, caller)) {
      if (postAuthorSettings.privacyPostsVisibleToFriendsOnly and not hasFriendInternal(caller, post.author)) {
        Runtime.trap("Unauthorized: Cannot view comments on this post");
      };
    };

    let commentArray = switch (commentsMap.get(postId)) {
      case (?comments) { comments.toArray() };
      case (null) { [] };
    };

    commentArray.sort(Comment.compareByTimestamp);
  };

  // --- Reactions ---
  public shared ({ caller }) func addReaction(postId : Text, reactionType : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add reactions");
    };

    let post = switch (allPostsMap.get(postId)) {
      case (?p) { p };
      case (null) { Runtime.trap("Post not found") };
    };

    // Check if caller can view the post
    let postAuthorSettings = switch (userSettings.get(post.author)) {
      case (?s) { s };
      case (null) { { displayName = ""; privacyPostsVisibleToFriendsOnly = false } };
    };

    if (caller != post.author and not AccessControl.isAdmin(accessControlState, caller)) {
      if (postAuthorSettings.privacyPostsVisibleToFriendsOnly and not hasFriendInternal(caller, post.author)) {
        Runtime.trap("Unauthorized: Cannot react to this post");
      };
    };

    let reactions = switch (reactionsMap.get(postId)) {
      case (?r) { r };
      case (null) { List.empty<Reaction>() };
    };

    // Remove existing reaction from this user
    let filteredReactions = List.empty<Reaction>();
    for (reaction in reactions.values()) {
      if (reaction.user != caller) {
        filteredReactions.add(reaction);
      };
    };

    // Add new reaction
    let newReaction : Reaction = {
      user = caller;
      reactionType;
      timestamp = Time.now();
    };
    filteredReactions.add(newReaction);

    reactionsMap.add(postId, filteredReactions);
  };

  public shared ({ caller }) func removeReaction(postId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can remove reactions");
    };

    let reactions = switch (reactionsMap.get(postId)) {
      case (?r) { r };
      case (null) { return };
    };

    let filteredReactions = List.empty<Reaction>();
    for (reaction in reactions.values()) {
      if (reaction.user != caller) {
        filteredReactions.add(reaction);
      };
    };

    reactionsMap.add(postId, filteredReactions);
  };

  public query ({ caller }) func getReactionsForPost(postId : Text) : async [Reaction] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view reactions");
    };

    let post = switch (allPostsMap.get(postId)) {
      case (?p) { p };
      case (null) { Runtime.trap("Post not found") };
    };

    // Check if caller can view the post
    let postAuthorSettings = switch (userSettings.get(post.author)) {
      case (?s) { s };
      case (null) { { displayName = ""; privacyPostsVisibleToFriendsOnly = false } };
    };

    if (caller != post.author and not AccessControl.isAdmin(accessControlState, caller)) {
      if (postAuthorSettings.privacyPostsVisibleToFriendsOnly and not hasFriendInternal(caller, post.author)) {
        Runtime.trap("Unauthorized: Cannot view reactions on this post");
      };
    };

    switch (reactionsMap.get(postId)) {
      case (?reactions) { reactions.toArray() };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getCallerReactionForPost(postId : Text) : async ?Reaction {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view reactions");
    };

    let reactions = switch (reactionsMap.get(postId)) {
      case (?r) { r };
      case (null) { return null };
    };

    for (reaction in reactions.values()) {
      if (reaction.user == caller) {
        return ?reaction;
      };
    };

    null;
  };

  // --- Notifications ---
  func createNotification(recipient : Principal, notificationType : { #friendRequest : { from : Principal }; #comment : { postId : Text; commentAuthor : Principal } }) {
    let notificationId = generateId();
    let notification : Notification = {
      id = notificationId;
      recipient;
      notificationType;
      timestamp = Time.now();
      isRead = false;
    };

    let existingNotifications = switch (notificationsMap.get(recipient)) {
      case (?notifications) { notifications };
      case (null) { List.empty<Notification>() };
    };

    existingNotifications.add(notification);
    notificationsMap.add(recipient, existingNotifications);
  };

  public query ({ caller }) func getCallerNotifications() : async [Notification] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };

    let notificationArray = switch (notificationsMap.get(caller)) {
      case (?notifications) { notifications.toArray() };
      case (null) { [] };
    };

    notificationArray.sort(Notification.compareByTimestamp);
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };

    let notifications = switch (notificationsMap.get(caller)) {
      case (?n) { n };
      case (null) { Runtime.trap("No notifications found") };
    };

    let updatedNotifications = List.empty<Notification>();
    var found = false;

    for (notification in notifications.values()) {
      if (notification.id == notificationId) {
        if (notification.recipient != caller) {
          Runtime.trap("Unauthorized: Can only mark your own notifications as read");
        };
        found := true;
        let updatedNotification : Notification = {
          id = notification.id;
          recipient = notification.recipient;
          notificationType = notification.notificationType;
          timestamp = notification.timestamp;
          isRead = true;
        };
        updatedNotifications.add(updatedNotification);
      } else {
        updatedNotifications.add(notification);
      };
    };

    if (not found) {
      Runtime.trap("Notification not found");
    };

    notificationsMap.add(caller, updatedNotifications);
  };

  public shared ({ caller }) func markAllNotificationsAsRead() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };

    let notifications = switch (notificationsMap.get(caller)) {
      case (?n) { n };
      case (null) { return };
    };

    let updatedNotifications = List.empty<Notification>();

    for (notification in notifications.values()) {
      let updatedNotification : Notification = {
        id = notification.id;
        recipient = notification.recipient;
        notificationType = notification.notificationType;
        timestamp = notification.timestamp;
        isRead = true;
      };
      updatedNotifications.add(updatedNotification);
    };

    notificationsMap.add(caller, updatedNotifications);
  };

  // Helper functions for followers/following (internal use only)
  func calcFollowers(user : Principal) : Nat {
    if (followingMap.isEmpty()) { return 0 };

    var count = 0;
    for ((other, followingSet) in followingMap.entries()) {
      if (followingSet.contains(user)) {
        count += 1;
      };
    };
    count;
  };

  func calcFollowing(user : Principal) : Nat {
    switch (followingMap.get(user)) {
      case (?following) { following.size() };
      case (null) { 0 };
    };
  };
};
