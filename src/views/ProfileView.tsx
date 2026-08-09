import React, { useState, useEffect } from 'react';
import { User, Church, FileText, Edit, Shield, Calendar, Heart, MessageCircle, Users, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Post } from '../types';
import { loadPostsByAuthor } from '../utils/posts';
import { getFollowersCount, getFollowingCount } from '../utils/follows';

interface ProfileViewProps {
  onOpenEditProfile: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenEditProfile }) => {
  const { profile } = useAuth();
  const { t } = useTheme();

  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchUserPosts();
    }
  }, [profile?.id]);

  const fetchUserPosts = async () => {
    if (!profile) return;
    setLoading(true);
    const posts = await loadPostsByAuthor(profile.id || profile.full_name);
    setUserPosts(posts);
    setLoading(false);
  };

  if (!profile) return null;

  const followersCount = getFollowersCount(profile.full_name);
  const followingCount = getFollowingCount();

  return (
    <div className="space-y-6">
      {/* Profile Header Banner */}
      <div className="relative rounded-3xl bg-[#f6ebd6] dark:bg-[#1c1611] border-2 border-[#c5a059] dark:border-[#8b6b4a] p-6 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              <img
                src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                alt={profile.full_name}
                className="w-20 h-20 rounded-3xl object-cover border-2 border-[#c5a059] shadow-xl"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#3d2b18] text-[#c5a059] flex items-center justify-center font-bold text-xs border border-[#c5a059]">
                ☨
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif-coptic font-bold text-xl md:text-2xl text-[#3d2b18] dark:text-[#f5ebd9] uppercase tracking-wider">
                  {profile.full_name}
                </h2>
                <span className="px-3 py-0.5 rounded-full bg-[#eedcb5] dark:bg-[#282019] text-[#3d2b18] dark:text-[#f5ebd9] border border-[#c5a059] text-[10px] font-serif font-bold uppercase tracking-wider">
                  {profile.role}
                </span>
              </div>

              <p className="text-xs text-[#a8833c] font-serif font-semibold flex items-center gap-1.5 mt-1 uppercase tracking-wider">
                <Church className="w-3.5 h-3.5" /> {profile.parish}
              </p>

              <p className="text-xs text-[#3d2b18] dark:text-[#f5ebd9] mt-2 max-w-lg font-serif leading-relaxed">
                {profile.bio || 'Orthodox Christian seeking fellowship and spiritual growth.'}
              </p>

              {/* Stats Bar */}
              <div className="flex items-center gap-6 mt-4 pt-3 border-t border-[#c5a059]/30 text-xs font-serif font-bold uppercase tracking-wider text-[#3d2b18] dark:text-[#f5ebd9]">
                <div>
                  <span className="text-[#a8833c] font-serif-coptic text-sm mr-1">{userPosts.length}</span>
                  <span className="text-[10px] text-[#7c5f3d] dark:text-[#a89379]">Posts</span>
                </div>
                <div>
                  <span className="text-[#a8833c] font-serif-coptic text-sm mr-1">{followersCount}</span>
                  <span className="text-[10px] text-[#7c5f3d] dark:text-[#a89379]">Followers</span>
                </div>
                <div>
                  <span className="text-[#a8833c] font-serif-coptic text-sm mr-1">{followingCount}</span>
                  <span className="text-[10px] text-[#7c5f3d] dark:text-[#a89379]">Following</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenEditProfile}
            className="px-5 py-2.5 rounded-2xl bg-[#a8833c] hover:bg-[#8f6e30] text-white font-serif font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Edit className="w-4 h-4" />
            <span>{t('editProfile')}</span>
          </button>
        </div>
      </div>

      {/* User's Posts Section */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-lg text-amber-100 pb-2 border-b border-amber-900/30">
          Your Reflections & Posts ({userPosts.length})
        </h3>

        {loading ? (
          <p className="text-xs text-amber-300 text-center py-6">Loading posts...</p>
        ) : userPosts.length === 0 ? (
          <div className="p-8 text-center bg-stone-950 rounded-2xl border border-amber-900/30 text-stone-400 text-xs">
            You haven't posted any reflections yet. Share something with your parish!
          </div>
        ) : (
          userPosts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-2xl bg-stone-950/80 border border-amber-900/30 space-y-2 shadow-lg"
            >
              <span className="text-[10px] text-stone-500 block">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <p className="text-xs text-stone-200">{post.text}</p>
              {post.image && (
                <img src={post.image} alt="Post" className="rounded-xl max-h-60 w-full object-cover mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
