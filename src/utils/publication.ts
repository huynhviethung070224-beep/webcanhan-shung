export interface PublishableBlogData {
  draft: boolean;
  publishedAt: Date;
}

/** Public only when explicitly non-draft and its publication time has arrived. */
export function isPublishedBlogData(data: PublishableBlogData, now = new Date()): boolean {
  return !data.draft && data.publishedAt.getTime() <= now.getTime();
}
