import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Comment {
    id: string;
    content: string;
    author: Principal;
    timestamp: Time;
    postAuthor: Principal;
    postId: string;
}
export interface UserDirectoryProfile {
    id: string;
    bio: string;
    displayName: string;
    avatarBlob?: ExternalBlob;
    joinedDate: Time;
    coverPhotoBlob?: ExternalBlob;
}
export interface FollowStats {
    followers: bigint;
    following: bigint;
}
export interface Post {
    id: string;
    media?: ExternalBlob;
    content: string;
    author: Principal;
    timestamp: Time;
    isPinned: boolean;
}
export interface Notification {
    id: string;
    notificationType: {
        __kind__: "comment";
        comment: {
            commentAuthor: Principal;
            postId: string;
        };
    } | {
        __kind__: "friendRequest";
        friendRequest: {
            from: Principal;
        };
    };
    recipient: Principal;
    isRead: boolean;
    timestamp: Time;
}
export interface UserSettings {
    privacyPostsVisibleToFriendsOnly: boolean;
    displayName: string;
}
export interface UserProfile {
    id: string;
    bio: string;
    displayName: string;
    avatarBlob?: ExternalBlob;
    joinedDate: Time;
    coverPhotoBlob?: ExternalBlob;
}
export interface Reaction {
    user: Principal;
    reactionType: string;
    timestamp: Time;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptFriendRequest(other: Principal): Promise<void>;
    addComment(postId: string, content: string): Promise<Comment>;
    addReaction(postId: string, reactionType: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelFriendRequest(target: Principal): Promise<void>;
    createPost(content: string, media: ExternalBlob | null): Promise<Post>;
    declineFriendRequest(other: Principal): Promise<void>;
    deleteComment(commentId: string, postId: string): Promise<void>;
    deletePost(postId: string): Promise<void>;
    followUser(target: Principal): Promise<void>;
    getCallerNotifications(): Promise<Array<Notification>>;
    getCallerReactionForPost(postId: string): Promise<Reaction | null>;
    getCallerSettings(): Promise<UserSettings | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommentsForPost(postId: string): Promise<Array<Comment>>;
    getFollowStats(user: Principal): Promise<FollowStats>;
    getFriends(user: Principal): Promise<Array<Principal>>;
    getPostsForUser(user: Principal): Promise<Array<Post>>;
    getReactionsForPost(postId: string): Promise<Array<Reaction>>;
    getTimeline(): Promise<Array<Post>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasFriend(user1: Principal, user2: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isFollowing(target: Principal): Promise<boolean>;
    markAllNotificationsAsRead(): Promise<void>;
    markNotificationAsRead(notificationId: string): Promise<void>;
    pinPost(postId: string): Promise<void>;
    removeReaction(postId: string): Promise<void>;
    saveCallerSettings(settings: UserSettings): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchUserProfiles(searchText: string): Promise<Array<UserDirectoryProfile>>;
    sendFriendRequest(target: Principal): Promise<void>;
    unfollowUser(target: Principal): Promise<void>;
    updatePost(postId: string, content: string, media: ExternalBlob | null): Promise<Post>;
}
