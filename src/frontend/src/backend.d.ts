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
export interface Post {
    id: string;
    media?: ExternalBlob;
    content: string;
    author: Principal;
    timestamp: Time;
}
export interface UserProfile {
    id: string;
    bio: string;
    displayName: string;
    avatarBlob?: ExternalBlob;
    coverPhotoBlob?: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptFriendRequest(other: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelFriendRequest(target: Principal): Promise<void>;
    createPost(content: string, media: ExternalBlob | null): Promise<Post>;
    declineFriendRequest(other: Principal): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFriends(user: Principal): Promise<Array<Principal>>;
    getPostsForUser(user: Principal): Promise<Array<Post>>;
    getTimeline(): Promise<Array<Post>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasFriend(user1: Principal, user2: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendFriendRequest(target: Principal): Promise<void>;
}
