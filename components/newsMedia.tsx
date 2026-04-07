"use client";

import { useState, useEffect, useRef } from "react"; 
import Link from "next/link"; 
import { createClient } from '@/lib/supabase/client';

// Define types for news media posts
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
  const [newsPosts, setNewsPosts] = useState<NewsMedia[]>([]); // For storinh fetched news posts, initially an empty array
  const [loading, setLoading] = useState(true); // For loading status, initially 'true'
  const scrollRef = useRef<HTMLDivElement>(null); // For scrolling

  // Data fetch
  useEffect(() => {
    const fetchNews = async () => { // Fetch news from Supabase
      try {
        const supabase = createClient(); // New Supabase client for request
        
        const { data, error } = await supabase
          .from('news_media') // Query 'news_media' table
          .select('*') // All cols (*)
          .order('fb_post_date', { ascending: false }); // To order by fb_post_date to display newest first

        // If Supabase returns an error, throw it to be caught below
        if (error) throw error;
        
        // Update with fetched data, or empty array if no data
        setNewsPosts(data || []);

      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch function
    fetchNews();
  }, []); // Run only when component loads

  // Horizontal scrolling for carousel
  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 400; // To scroll px
      // ScrollBy for smooth scrolling
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
        className="w-full bg-[#fbfaf8] min-h-screen flex items-center justify-center" //default bg
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', //dotted
          backgroundSize: "20px 20px" //distance between dots
        }}
      >
        {/* Animated spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d21a1]"></div>
      </div>
    );
  }

  // ROW MANAGEMENT
  const latestPosts = newsPosts.slice(0, 3); // First 3 posts for static and newest posts
  const carouselPosts = newsPosts.slice(3); // Others posts

  return (
    <div 
      className="w-full bg-[#fbfaf8] py-16 px-4 md:px-8 lg:px-16" //default bg 
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: "20px 20px"
      }}
    >
      {/* Heading */}
      <div className="text-center mb-12">

        {/* Title & Sub */}
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
          {/* Map through latest posts & render each NewsCard */}
          {latestPosts.map(post => (
            <NewsCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* 2nd ROW:Carousel Section/Additional Posts */}
      {carouselPosts.length > 0 && (
        <div className="relative">

          {/* Sub */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl text-[#eec643]">♠</span>
            <h1 className="text-3xl md:text-2xl font-bold text-[#011638]">More Updates</h1>
          </div>

          {/* Carousel Container */}
          <div className="relative">

            {/* Scroll Button */}
            {/* Left Scroll */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all"
              aria-label="Scroll left"
            >
              {/* Left arrow */}
              <svg className="w-5 h-5 text-[#0d21a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Scroll */}
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all"
              aria-label="Scroll right"
            >
              {/* Right arrow */}
              <svg className="w-5 h-5 text-[#0d21a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scrollable Cards Container */}
            <div
              ref={scrollRef} // Ref for scroll control
              className="flex overflow-x-auto gap-6 pb-2 px-10 scrollbar-hide" // Hide scrollbar (aesthetic-wise)
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >

              {/* Map through carousel posts and render each */}
              {carouselPosts.map(post => (
                <div key={post.id} className="flex-none w-80">
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
  const formatDate = (date: string) => { //format date as "MMM D, YYYY"
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',  
      day: 'numeric', 
      year: 'numeric'   
    });
  };

  return (
    // Link posts to their url, open in new tab
    <Link href={post.post_url} target="_blank" rel="noopener noreferrer">

      {/* Card */}
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
        {/* Image */}
        <div className="h-48 rounded-t-lg overflow-hidden bg-gray-100 relative">
          {/* Show if image exists */}
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No image</span> {/* placeholder if no image */}
            </div>
          )}
          {/* Date */}
          <div className="absolute top-3 right-3">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#0d21a1] shadow-sm">
              {formatDate(post.fb_post_date)}
            </span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-bold text-lg text-[#011638] mb-2 line-clamp-2 hover:text-[#0d21a1] transition-colors">
            {post.title}
          </h3>
          
          {/* Content preview */}
          {post.content && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {post.content}
            </p>
          )}

          {/* Read More */}
          <div className="mt-auto flex items-center text-[#eec643] font-medium text-sm group">
            <span>Read more</span>
            {/* Arrow */}
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}