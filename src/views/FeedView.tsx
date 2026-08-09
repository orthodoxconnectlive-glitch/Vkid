import React, { useState, useEffect } from 'react';
import {
  Image,
  Video,
  Send,
  Heart,
  MessageCircle,
  Repeat,
  Share2,
  Trash2,
  Church,
  Sparkles,
  Bookmark,
  Flag,
  UserPlus,
  UserCheck,
  Check,
} from 'lucide-react';
import { Post } from '../types';
import { loadPosts, savePost, deletePost, BUNNY_STREAM_BASE, SEED_VIDEOS } from '../utils/posts';
import { isFollowing, toggleFollow } from '../utils/follows';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BunnyPlayer } from '../components/BunnyPlayer';
import { ReshareModal } from '../components/ReshareModal';
import { ReportContentModal } from '../components/ReportContentModal';
import { StoriesBar } from '../components/StoriesBar';

export const FeedView: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useTheme();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedTab, setFeedTab] = useState<'all' | 'following'>('all');
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New post input state
  const [newPostText, setNewPostText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comments drawer / modal state
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [commentsMap, setCommentsMap] = useState<Record<string, string[]>>({
    'post-seed-1': ['Blessed feast Father!', 'Glory to God in the highest.'],
    'post-seed-2': ['Beautiful chanting!'],
  });

  // Reshare modal state
  const [reshareTargetPost, setReshareTargetPost] = useState<Post | null>(null);

  // Report modal state
  const [reportModalData, setReportModalData] = useState<{
    isOpen: boolean;
    contentType: 'post' | 'comment';
    contentId: string;
    targetAuthorName: string;
    snippet: string;
  }>({
    isOpen: false,
    contentType: 'post',
    contentId: '',
    targetAuthorName: '',
    snippet: '',
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const fetchPosts = async () => {
    setLoading(true);
    const loaded = await loadPosts();
    setPosts(loaded);

    // Initialize follow status map for authors
    const fMap: Record<string, boolean> = {};
    loaded.forEach((p) => {
      fMap[p.authorName] = isFollowing(p.authorName);
    });
    setFollowedMap(fMap);

    setLoading(false);
  };

  const handleToggleFollowUser = (authorName: string) => {
    const isNowFollowing = toggleFollow(authorName);
    setFollowedMap((prev) => ({
      ...prev,
      [authorName]: isNowFollowing,
    }));
    triggerToast(
      isNowFollowing
        ? `Now following ${authorName}. You will see all their reflections!`
        : `Unfollowed ${authorName}.`
    );
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !imageUrl && !videoUrl) return;

    setIsSubmitting(true);

    const created = await savePost({
      text: newPostText.trim(),
      authorName: profile?.full_name || 'Fr. Seraphim Rose',
      authorParish: profile?.parish || 'St. Herman Monastery',
      authorAvatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      authorId: profile?.id,
      image: imageUrl || undefined,
      video: videoUrl || undefined,
    });

    setPosts([created, ...posts]);
    setNewPostText('');
    setImageUrl('');
    setVideoUrl('');
    setShowImageInput(false);
    setShowVideoInput(false);
    setIsSubmitting(false);
  };

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? (p.likesCount || 0) + 1 : Math.max(0, (p.likesCount || 1) - 1),
          };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), commentInput.trim()],
    }));

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p))
    );

    setCommentInput('');
  };

  const handleDelete = async (postId: string) => {
    await deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleOpenReport = (
    contentType: 'post' | 'comment',
    contentId: string,
    targetAuthorName: string,
    snippet: string
  ) => {
    setReportModalData({
      isOpen: true,
      contentType,
      contentId,
      targetAuthorName,
      snippet,
    });
  };

  const filteredPosts =
    feedTab === 'all'
      ? posts
      : posts.filter(
          (p) =>
            followedMap[p.authorName] ||
            (profile?.full_name && p.authorName.toLowerCase() === profile.full_name.toLowerCase())
        );

  return (
    <div className="space-y-6">
      {/* Toast notification message */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-[#3d2b18] text-[#f5ebd9] border-2 border-[#c5a059] shadow-2xl font-serif text-xs flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-[#c5a059]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Stories Bar Component */}
      <StoriesBar />

      {/* Post Creation Box (Photo 2) */}
      <div className="bg-[#f6ebd6] dark:bg-[#1c1611] border-2 border-[#c5a059] dark:border-[#8b6b4a] rounded-3xl p-4 shadow-lg">
        <form onSubmit={handleCreatePost} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#3d2b18] text-[#c5a059] flex items-center justify-center font-bold text-lg shrink-0 shadow-md border-2 border-[#c5a059]">
              ☨
            </div>
            <div className="flex-1 rounded-2xl bg-[#eedcb5] dark:bg-[#282019] border border-[#c5a059] dark:border-[#8b6b4a] p-2.5">
              <input
                type="text"
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder={t('sharePost')}
                className="w-full bg-transparent text-xs font-serif uppercase tracking-wider text-[#3d2b18] dark:text-[#f5ebd9] placeholder-[#7c5f3d] dark:placeholder-[#a89379] focus:outline-none"
              />
            </div>
          </div>

          {/* Media URL inputs */}
          {showImageInput && (
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste image URL (Unsplash, HTTPS)..."
              className="w-full p-2.5 rounded-xl bg-[#eedcb5] dark:bg-[#282019] border border-[#c5a059] text-xs text-[#3d2b18] dark:text-[#f5ebd9] focus:outline-none"
            />
          )}

          {showVideoInput && (
            <div className="space-y-2">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste video URL or Bunny Stream link..."
                className="w-full p-2.5 rounded-xl bg-[#eedcb5] dark:bg-[#282019] border border-[#c5a059] text-xs text-[#3d2b18] dark:text-[#f5ebd9] focus:outline-none font-mono text-[11px]"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVideoUrl(SEED_VIDEOS[0])}
                  className="px-2 py-1 bg-[#e6d3ab] text-[#3d2b18] font-bold text-[10px] rounded border border-[#c5a059]"
                >
                  + Sample Bunny Video 1
                </button>
                <button
                  type="button"
                  onClick={() => setVideoUrl(SEED_VIDEOS[1])}
                  className="px-2 py-1 bg-[#e6d3ab] text-[#3d2b18] font-bold text-[10px] rounded border border-[#c5a059]"
                >
                  + Sample Bunny Video 2
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#c5a059]/30">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showImageInput ? 'bg-[#c5a059] text-white font-bold' : 'text-[#7c5f3d] hover:text-[#3d2b18]'
                }`}
              >
                <Image className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span className="hidden sm:inline font-serif uppercase tracking-wider text-[11px]">Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setShowVideoInput(!showVideoInput)}
                className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showVideoInput ? 'bg-[#c5a059] text-white font-bold' : 'text-[#7c5f3d] hover:text-[#3d2b18]'
                }`}
              >
                <Video className="w-4 h-4 text-[#a8833c]" />
                <span className="hidden sm:inline font-serif uppercase tracking-wider text-[11px]">Bunny Video</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (!newPostText.trim() && !imageUrl && !videoUrl)}
              className="px-5 py-2 rounded-xl bg-[#a8833c] hover:bg-[#8f6e30] text-white font-serif uppercase tracking-wider font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting...' : t('post')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Feed Mode Switcher (ALL POSTS vs FOLLOWING) */}
      <div className="flex items-center justify-between bg-[#f6ebd6] dark:bg-[#1c1611] border-2 border-[#c5a059] p-1.5 rounded-2xl shadow-md font-serif text-xs">
        <button
          onClick={() => setFeedTab('all')}
          className={`flex-1 py-2 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
            feedTab === 'all'
              ? 'bg-[#3d2b18] text-[#c5a059] shadow-md border border-[#c5a059]'
              : 'text-[#7c5f3d] hover:text-[#3d2b18] dark:text-[#a89379]'
          }`}
        >
          {t('allParishFeed')} ({posts.length})
        </button>
        <button
          onClick={() => setFeedTab('following')}
          className={`flex-1 py-2 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
            feedTab === 'following'
              ? 'bg-[#3d2b18] text-[#c5a059] shadow-md border border-[#c5a059]'
              : 'text-[#7c5f3d] hover:text-[#3d2b18] dark:text-[#a89379]'
          }`}
        >
          {t('followingFeed')} ({filteredPosts.length})
        </button>
      </div>

      {/* Main Feed Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center bg-[#f6ebd6] dark:bg-[#1c1611] rounded-3xl border-2 border-[#c5a059]">
            <Sparkles className="w-8 h-8 mx-auto text-[#a8833c] animate-spin mb-2" />
            <p className="text-xs text-[#7c5f3d] font-serif uppercase tracking-wider">Loading parish feed...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-8 text-center bg-[#f6ebd6] dark:bg-[#1c1611] rounded-3xl border-2 border-[#c5a059] text-[#7c5f3d] text-xs font-serif uppercase space-y-3">
            <p className="font-bold text-[#3d2b18] dark:text-[#f5ebd9]">
              {feedTab === 'following'
                ? "You aren't following anyone with active posts yet."
                : 'No posts found in the parish feed.'}
            </p>
            {feedTab === 'following' && (
              <p className="text-[11px] text-[#a8833c]">
                Switch to "All Parish Feed" to discover and follow other parish members!
              </p>
            )}
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-[#f6ebd6] dark:bg-[#1c1611] border-2 border-[#c5a059] dark:border-[#8b6b4a] rounded-3xl p-5 shadow-lg transition-all"
            >
              {/* Reshare Header Notice */}
              {post.reshareKind && (
                <div className="flex items-center gap-1.5 text-xs text-[#d4af37] font-bold mb-3 pb-2 border-b border-[#d4af37]/20">
                  <Repeat className="w-3.5 h-3.5" />
                  <span>
                    {post.reshareKind === 'quote' ? 'Quoted Post' : 'Reshared to Fellowship Feed'}
                  </span>
                </div>
              )}

              {/* Author Header (Matching Photo 2 + Follow Button) */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#c5a059]"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#3d2b18] text-[#c5a059] flex items-center justify-center text-[10px] font-bold border border-[#c5a059]">
                      ☨
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-serif-coptic font-bold text-xs sm:text-sm text-[#3d2b18] dark:text-[#f5ebd9] uppercase tracking-wider">
                        {post.authorName}
                      </h4>

                      {/* Follow / Following Button */}
                      {profile?.full_name?.toLowerCase() !== post.authorName.toLowerCase() && (
                        <button
                          onClick={() => handleToggleFollowUser(post.authorName)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-serif font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                            followedMap[post.authorName]
                              ? 'bg-[#eedcb5] dark:bg-[#282019] text-[#7c5f3d] border border-[#c5a059]'
                              : 'bg-[#a8833c] hover:bg-[#8f6e30] text-white shadow-sm'
                          }`}
                        >
                          {followedMap[post.authorName] ? (
                            <>
                              <UserCheck className="w-3 h-3 text-[#a8833c]" />
                              <span>{t('following')}</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3" />
                              <span>{t('follow')}</span>
                            </>
                          )}
                        </button>
                      )}

                      <span className="text-[10px] text-[#7c5f3d] dark:text-[#a89379] font-serif uppercase tracking-wider">
                        · JUST NOW
                      </span>
                    </div>
                    <p className="text-[10px] text-[#7c5f3d] dark:text-[#a89379] font-serif uppercase tracking-wider mt-0.5 font-semibold">
                      — RECORDED LIVE BROADCAST
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleOpenReport(
                        'post',
                        post.id,
                        post.authorName,
                        post.text || 'Post Media Content'
                      )
                    }
                    className="p-1.5 rounded-lg text-[#7c5f3d] hover:text-[#3d2b18] hover:bg-[#e6d3ab] transition-colors cursor-pointer"
                    title="Flag / Report Content"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>

                  {(profile?.id === post.authorId || profile?.role === 'admin' || profile?.role === 'owner') && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-1.5 rounded-lg text-[#7c5f3d] hover:text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                      title="Delete Post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Text Content */}
              {post.text && (
                <p className="text-xs text-[#3d2b18] dark:text-[#f5ebd9] font-serif leading-relaxed mb-3 whitespace-pre-wrap">
                  {post.text}
                </p>
              )}

              {/* Image Media */}
              {post.image && (
                <div className="rounded-xl overflow-hidden mb-3 border border-[#d4af37]/30 max-h-96">
                  <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Video Media (Bunny Stream) */}
              {post.video && (
                <div className="mb-3">
                  <BunnyPlayer videoUrl={post.video} title={post.text} />
                </div>
              )}

              {/* Quoted Sub-Post */}
              {post.quotedPost && (
                <div className="p-3 mb-3 rounded-xl bg-[#f5f2ed] border border-[#d4af37]/30 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.quotedPost.authorAvatar}
                      alt={post.quotedPost.authorName}
                      className="w-5 h-5 rounded-full object-cover border border-[#d4af37]"
                    />
                    <span className="font-bold text-[#5a4632]">{post.quotedPost.authorName}</span>
                    <span className="text-[10px] text-[#8b6b4a]">• {post.quotedPost.authorParish}</span>
                  </div>
                  <p className="text-[#2c2c2c] italic pl-7">"{post.quotedPost.text}"</p>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-[#d4af37]/20 text-xs">
                <button
                  onClick={() => handleToggleLike(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    post.isLiked
                      ? 'bg-red-100 text-red-600 font-bold border border-red-200'
                      : 'text-[#8b6b4a] hover:text-red-600 hover:bg-[#f1ebd7]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current text-red-600' : ''}`} />
                  <span>{post.likesCount || 0}</span>
                </button>

                <button
                  onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[#8b6b4a] hover:text-[#5a4632] hover:bg-[#f1ebd7] transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#d4af37]" />
                  <span>{post.commentsCount || 0}</span>
                </button>

                <button
                  onClick={() => setReshareTargetPost(post)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[#8b6b4a] hover:text-[#5a4632] hover:bg-[#f1ebd7] transition-colors cursor-pointer"
                >
                  <Repeat className="w-4 h-4 text-[#d4af37]" />
                  <span>{post.resharesCount || 0}</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://orthodoxconnect.live/post/${post.id}`);
                  }}
                  className="p-1.5 text-[#8b6b4a] hover:text-[#5a4632] hover:bg-[#f1ebd7] rounded-xl transition-colors cursor-pointer"
                  title="Copy link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Comments Drawer */}
              {activeCommentPostId === post.id && (
                <div className="mt-3 pt-3 border-t border-[#d4af37]/20 space-y-2">
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {(commentsMap[post.id] || []).map((cText, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-[#f5f2ed] border border-[#d4af37]/20 text-[11px] text-[#2c2c2c] flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-[#5a4632] mr-2">Orthodox Member:</span>
                          {cText}
                        </div>
                        <button
                          onClick={() =>
                            handleOpenReport(
                              'comment',
                              `comment-${post.id}-${idx}`,
                              'Orthodox Member',
                              cText
                            )
                          }
                          className="text-[#8b6b4a] hover:text-amber-700 p-1"
                          title="Report Comment"
                        >
                          <Flag className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Write a spiritual reflection or comment..."
                      className="flex-1 p-2 rounded-xl bg-[#f5f2ed] border border-[#d4af37]/30 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#d4af37]"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="px-3 py-1.5 bg-[#d4af37] hover:bg-[#b89528] text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reshare Modal */}
      <ReshareModal
        post={reshareTargetPost}
        isOpen={Boolean(reshareTargetPost)}
        onClose={() => setReshareTargetPost(null)}
        onReshareCreated={(newPost) => setPosts([newPost, ...posts])}
      />

      {/* Content Flagging & Reporting Modal */}
      <ReportContentModal
        isOpen={reportModalData.isOpen}
        onClose={() => setReportModalData((prev) => ({ ...prev, isOpen: false }))}
        contentType={reportModalData.contentType}
        contentId={reportModalData.contentId}
        targetAuthorName={reportModalData.targetAuthorName}
        contentSnippet={reportModalData.snippet}
      />
    </div>
  );
};

