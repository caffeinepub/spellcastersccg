import Array "mo:core/Array";
import Set "mo:core/Set";
import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Blob "mo:core/Blob";
import Option "mo:core/Option";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";

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

  public type UserProfile = {
    id : Text;
    displayName : Text;
    bio : Text;
    avatarBlob : ?Storage.ExternalBlob;
    coverPhotoBlob : ?Storage.ExternalBlob;
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
  };

  module Post {
    public func compareByTimestamp(post1 : Post, post2 : Post) : Order.Order {
      if (post1.timestamp > post2.timestamp) { #less } else if (post1.timestamp < post2.timestamp) {
        #greater;
      } else { #equal };
    };
  };

  // Persistent maps for friends, friend requests, posts, and profiles
  let friendshipsMap = Map.empty<Principal, Set.Set<Principal>>();
  let postsMap = Map.empty<Principal, List.List<Post>>();
  let outgoingRequestsMap = Map.empty<Principal, Set.Set<Principal>>();
  let incomingRequestsMap = Map.empty<Principal, Set.Set<Principal>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func generateId() : Text {
    Time.now().toText();
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Allow authenticated users to view any public profile (for user directory/search)
    // Admins can also view profiles
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save their profile. Anonymous principal is not a user. Please sign in.");
    };
    userProfiles.add(caller, profile);
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
    // Users can view their own friends list, their friends' friends lists, or admins can view any
    if (caller != user and not hasFriendInternal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own friends list or your friends' friends lists");
    };
    switch (friendshipsMap.get(user)) {
      case (?friends) { friends.toArray() };
      case (null) { [] };
    };
  };

  // Helper functions
  public query ({ caller }) func hasFriend(user1 : Principal, user2 : Principal) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can check friendship status");
    };
    // Users can check their own friendships, friendships between their friends, or admins can check any
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

  // Posts
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
    };

    let existingPosts = switch (postsMap.get(caller)) {
      case (?posts) { posts };
      case (null) {
        List.empty<Post>();
      };
    };

    existingPosts.add(post);
    postsMap.add(caller, existingPosts);

    post;
  };

  public query ({ caller }) func getPostsForUser(user : Principal) : async [Post] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };
    // Users can view their own posts, their friends' posts, or admins can view any
    if (caller != user and not hasFriendInternal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own posts or your friends' posts");
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
};
