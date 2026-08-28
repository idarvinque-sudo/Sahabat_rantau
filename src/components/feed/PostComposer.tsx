import React, { useState } from 'react';
import { Image, Smile, MapPin, Send, Sparkles, X, Check, Loader2, Globe, Users, Tag } from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';
import { Post, UserProfile, PostCategory, PostVisibility } from '../../types';
import { createPost } from '../../firebase/postService';

interface PostComposerProps {
  onAddPost?: (newPost: Post) => void;
  isOpenAsModal?: boolean;
  onCloseModal?: () => void;
  currentUser?: UserProfile | null;
}

const CATEGORIES: { label: string; value: PostCategory; icon: string }[] = [
  { label: 'Pengalaman PMI', value: 'Pengalaman PMI', icon: '✨' },
  { label: 'Tips Kerja', value: 'Tips Kerja', icon: '💼' },
  { label: 'Info Penting', value: 'Info Penting', icon: '📢' },
  { label: 'Tanya Jawab', value: 'Tanya Jawab', icon: '❓' },
  { label: 'Curhat', value: 'Curhat', icon: '💬' },
  { label: 'Hiburan', value: 'Hiburan', icon: '🎉' },
  { label: 'Kuliner', value: 'Kuliner', icon: '🍲' },
];

export const PostComposer: React.FC<PostComposerProps> = ({
  onAddPost,
  isOpenAsModal = false,
  onCloseModal,
  currentUser,
}) => {
  const [content, setContent] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<PostCategory>('Pengalaman PMI');
  const [selectedVisibility, setSelectedVisibility] = useState<PostVisibility>('public');
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>(
    currentUser ? `${currentUser.city || 'Taipei'}, ${currentUser.country || 'Taiwan'} 🇹🇼` : 'Taipei, Taiwan 🇹🇼'
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [showFeelingPicker, setShowFeelingPicker] = useState<boolean>(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const samplePhotos = [
    'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=900',
  ];

  const feelings = [
    { emoji: '🥰', label: 'Bersyukur' },
    { emoji: '💪', label: 'Semangat' },
    { emoji: '☕', label: 'Santai' },
    { emoji: '🏠', label: 'Rindu Rumah' },
    { emoji: '🍜', label: 'Lapar' },
    { emoji: '❤️', label: 'Bahagia' },
  ];

  const locations = [
    'Taipei, Taiwan 🇹🇼',
    'Taichung, Taiwan 🇹🇼',
    'Kaohsiung, Taiwan 🇹🇼',
    'Causeway Bay, Hong Kong 🇭🇰',
    'Victoria Park, Hong Kong 🇭🇰',
    'Lucky Plaza, Singapura 🇸🇬',
    'Kuala Lumpur, Malaysia 🇲🇾',
    'Jeddah, Arab Saudi 🇸🇦',
    'Tokyo, Jepang 🇯🇵',
    'Seoul, Korea Selatan 🇰🇷',
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !photoPreview) return;

    const fullContent = selectedFeeling
      ? `${selectedFeeling} • ${content.trim()}`
      : content.trim();

    setIsSubmitting(true);
    try {
      if (currentUser) {
        await createPost(
          currentUser,
          fullContent,
          selectedLocation,
          photoPreview || undefined,
          selectedCategory,
          selectedVisibility
        );
      } else {
        const newPost: Post = {
          id: `post_${Date.now()}`,
          author: {
            id: 'guest_user',
            name: 'Sahabat PMI',
            fullName: 'Sahabat PMI',
            avatar: APP_CONFIG.DEFAULT_AVATAR,
            location: selectedLocation,
            country: 'Taiwan',
            countryFlag: '🇹🇼',
            isVerified: false,
          },
          createdAt: 'Baru saja',
          locationText: selectedLocation,
          content: fullContent,
          imageUrl: photoPreview || undefined,
          category: selectedCategory,
          visibility: selectedVisibility,
          likesCount: 0,
          reactionsCount: {},
          commentsCount: 0,
          sharesCount: 0,
          isLiked: false,
          comments: [],
        };
        if (onAddPost) onAddPost(newPost);
      }

      setContent('');
      setSelectedFeeling(null);
      setPhotoPreview(null);
      if (onCloseModal) {
        onCloseModal();
      }
    } catch (err) {
      console.error('Error submitting post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const authorAvatar = currentUser?.photoURL || APP_CONFIG.DEFAULT_AVATAR;
  const authorName = currentUser?.fullName?.split(' ')[0] || 'Sahabat';

  return (
    <div
      id="post-composer-card"
      className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 mb-3"
    >
      {/* Top Profile + Privacy Selector */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-100 shrink-0"
          />
          <div>
            <p className="text-xs font-bold text-slate-800">{currentUser?.fullName || authorName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <button
                type="button"
                onClick={() => setSelectedVisibility(selectedVisibility === 'public' ? 'friends' : 'public')}
                className="flex items-center gap-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-colors"
              >
                {selectedVisibility === 'public' ? (
                  <>
                    <Globe size={11} className="text-purple-600" />
                    <span>Publik</span>
                  </>
                ) : (
                  <>
                    <Users size={11} className="text-pink-600" />
                    <span>Teman</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                className="flex items-center gap-1 text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors border border-purple-200"
              >
                <Tag size={10} />
                <span>{selectedCategory}</span>
              </button>
            </div>
          </div>
        </div>

        {isOpenAsModal && onCloseModal && (
          <button
            onClick={onCloseModal}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Dropdown */}
      {showCategoryPicker && (
        <div className="mb-3 p-2 bg-purple-50/70 rounded-xl border border-purple-100 flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.value);
                setShowCategoryPicker(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-purple-100'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Textarea Input */}
      <div>
        <textarea
          id="composer-input-text"
          rows={isOpenAsModal ? 4 : 2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Apa kabar hari ini, ${authorName}? Ceritakan pengalaman atau tips untuk sesama PMI...`}
          className="w-full resize-none bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-400"
        />

        {/* Active Tags / Feeling / Photo Badges */}
        {(selectedFeeling || photoPreview || selectedLocation) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {selectedFeeling && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full border border-pink-200">
                <span>{selectedFeeling}</span>
                <X
                  size={12}
                  className="cursor-pointer hover:text-pink-900"
                  onClick={() => setSelectedFeeling(null)}
                />
              </span>
            )}
            {selectedLocation && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                <MapPin size={11} />
                <span>{selectedLocation}</span>
              </span>
            )}
            {photoPreview && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                <span>📷 Foto Terlampir</span>
                <X
                  size={12}
                  className="cursor-pointer hover:text-emerald-900"
                  onClick={() => setPhotoPreview(null)}
                />
              </span>
            )}
          </div>
        )}

        {/* Photo Preview Thumbnail */}
        {photoPreview && (
          <div className="mt-2 relative rounded-xl overflow-hidden max-h-48 border border-slate-200">
            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={() => setPhotoPreview(null)}
              className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Media & Mood Shortcuts */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* File Upload / Sample Photo */}
          <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer">
            <Image size={16} />
            <span className="hidden xs:inline">Foto</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </label>

          {/* Preset Photo Picker */}
          <button
            type="button"
            onClick={() => {
              const randomPhoto = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
              setPhotoPreview(randomPhoto);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Pilih contoh foto PMI"
          >
            <Sparkles size={13} className="text-amber-500" />
            <span>Contoh Foto</span>
          </button>

          {/* Perasaan */}
          <button
            id="composer-btn-feeling"
            type="button"
            onClick={() => setShowFeelingPicker(!showFeelingPicker)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
          >
            <Smile size={16} />
            <span className="hidden xs:inline">Perasaan</span>
          </button>

          {/* Lokasi */}
          <button
            id="composer-btn-location"
            type="button"
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
          >
            <MapPin size={16} />
            <span className="hidden xs:inline">Lokasi</span>
          </button>
        </div>

        {/* Submit Button */}
        <button
          id="composer-btn-submit"
          type="button"
          onClick={handleSubmit}
          disabled={(!content.trim() && !photoPreview) || isSubmitting}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-xs shadow-purple-600/30 flex items-center gap-1.5 active:scale-98 transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Memposting...</span>
            </>
          ) : (
            <>
              <Send size={13} />
              <span>Posting</span>
            </>
          )}
        </button>
      </div>

      {/* Feeling Picker Drawer */}
      {showFeelingPicker && (
        <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-1.5 animate-in fade-in">
          {feelings.map((f) => (
            <button
              key={f.label}
              onClick={() => {
                setSelectedFeeling(`${f.emoji} Merasa ${f.label}`);
                setShowFeelingPicker(false);
              }}
              className="text-xs bg-white hover:bg-pink-50 hover:text-pink-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{f.emoji}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Location Picker Drawer */}
      {showLocationPicker && (
        <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-1.5 animate-in fade-in">
          {locations.map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setSelectedLocation(loc);
                setShowLocationPicker(false);
              }}
              className="text-xs bg-white hover:bg-purple-50 hover:text-purple-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <MapPin size={12} className="text-purple-600" />
              <span>{loc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

