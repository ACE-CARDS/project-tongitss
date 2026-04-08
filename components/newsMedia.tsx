"use client";

import { useState, useEffect, useRef } from "react"; 
import Link from "next/link"; 
import { createClient } from '@/lib/supabase/client';

// Types for news media posts
interface NewsMedia {
  id: number;              
  title: string;           
  content: string;         
  image_url: string;      
  post_url: string;       
  fb_post_date: string;   
  created_at: string;    
}

// Main export
export default function NewsMedia() {
  const [newsPosts, setNewsPosts] = useState<NewsMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // state for scroll buttons
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Data fetch
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const supabase = createClient();
        
        const { data, error } = await supabase
          .from('news_media')
          .select('*')
          .order('fb_post_date', { ascending: false });

        if (error) throw error;
        
        setNewsPosts(data || []);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // ROW MANAGEMENT
  const latestPosts = newsPosts.slice(0, 3);
  const carouselPosts = newsPosts.slice(3);

  // Check scroll position and update button states
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  // Scroll event listener
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement && carouselPosts.length > 0) {
      // Delay to ensure DOM is rendered
      setTimeout(() => {
        checkScrollPosition();
      }, 100);
      
      // Add scroll event listener
      scrollElement.addEventListener('scroll', checkScrollPosition);
      
      // Cleanup
      return () => {
        scrollElement.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, [carouselPosts]); //defined carouselPosts

  // Horizontal scrolling for carousel
  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 1000;
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  };

  // Loading spinner
  if (loading) {
    return (
      <div 
        className="w-full bg-[#fbfaf8] max-w-[1920px] min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: "20px 20px"
        }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d21a1]"></div>
      </div>
    );
  }

  return (
    <div 
      className="w-full mx-auto bg-[#fbfaf8] max-w-[1920px] pt-12 px-4 md:px-8 lg:px-16 justify-center"
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: "20px 20px",
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Heading */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-5xl text-[#eec643]">♠</span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#011638]">NEWS & MEDIA</h1>
          <span className="text-5xl text-[#eec643]">♠</span>
        </div>

        <p className="text-gray-600 max-w-2xl mx-auto">
          Stay updated with the latest announcements and activities from ACE CARDS.
        </p>
      </div>

      {/* 1st ROW: Latest Posts */}
      {latestPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"> 
          {latestPosts.map(post => (
            <NewsCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* 2nd ROW: Carousel Section/Additional Posts */}
      {carouselPosts.length > 0 && (
        <div className="relative">
          {/* Sub heading */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-4xl text-[#eec643]">♠</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#011638]">More Updates</h2>
            <span className="text-4xl text-[#eec643]">♠</span>
          </div>

          {/* Carousel Container */}
          <div className="relative px-11">
            {/* Left Scroll Button */}
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md transition-all ${
                canScrollLeft 
                  ? 'hover:shadow-lg cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              aria-label="Scroll left"
            >
              <svg className={`w-5 h-5 ${canScrollLeft ? 'text-[#0d21a1]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Scroll Button */}
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md transition-all ${
                canScrollRight 
                  ? 'hover:shadow-lg cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              aria-label="Scroll right"
            >
              <svg className={`w-5 h-5 ${canScrollRight ? 'text-[#0d21a1]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scrollable Cards Container */}
            <div
              ref={scrollRef}
              className="flex overflow-x-auto gap-6 pb-5 hide-scrollbar"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none', 
              }}
            >
              {carouselPosts.map(post => (
                <div key={post.id} className="flex-none w-80 py-2">
                  <NewsCard post={post} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// For each news cards
function NewsCard({ post }: { post: NewsMedia }) {
  const [imgError, setImgError] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',  
      day: 'numeric', 
      year: 'numeric'   
    });
  };

  return (
    <Link href={post.post_url} target="_blank" rel="noopener noreferrer">
      <div className="rounded-lg overflow-hidden transition-all duration-300 bg-white flex flex-col h-full hover:shadow-xl hover:scale-[1.02] hover:z-10 shadow-sm">
        <div className="h-48 rounded-t-lg overflow-hidden bg-gray-100 relative">
          {(!post.image_url || imgError) ? (
            <div className="w-full h-full flex items-center justify-center bg-[#011638]">
              <img
                src="/assets/logos/ACE CARDS logo.png"
                alt="ACE CARDS Logo"
                className="w-24 h-24 object-contain opacity-80"
              />
            </div>
          ) : (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
            />
          )}
          <div className="absolute top-3 right-3">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#0d21a1] shadow-lg">
              {formatDate(post.fb_post_date)}
            </span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-lg text-[#011638] mb-2 line-clamp-2 hover:text-[#0d21a1] transition-colors">
            {post.title}
          </h3>
          
          {post.content && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {post.content}
            </p>
          )}

          <div className="mt-auto flex items-center text-[#eec643] font-medium text-sm group">
            <span>Read more</span>
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}