//https://www.letsbuildui.dev/articles/how-to-build-a-card-flip-animation/
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
  
  const [showSecondRow, setShowSecondRow] = useState(false); // Visibility of carousel

  // Flip animation states
  const [flippedLatestCards, setFlippedLatestCards] = useState<number[]>([]); 
  const [flippedCarouselCards, setFlippedCarouselCards] = useState<number[]>([]); 
  const [carouselHasFlipped, setCarouselHasFlipped] = useState(false);  
  const [firstRowAnimationComplete, setFirstRowAnimationComplete] = useState(false); 
  const [isCarouselVisible, setIsCarouselVisible] = useState(false); 
  const latestSectionRef = useRef<HTMLDivElement>(null);
  const carouselSectionRef = useRef<HTMLDivElement>(null); 
  
  // Timeout IDs
  const latestTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const carouselTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

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
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // ROW MANAGEMENT
  const latestPosts = newsPosts.slice(0, 3);
  const carouselPosts = newsPosts.slice(3);

  // Clear timeouts
  const clearTimeouts = (timeoutArray: NodeJS.Timeout[]) => {
    timeoutArray.forEach(timeout => clearTimeout(timeout)); 
  };

  // Reset cards to unflipped
  const resetCarouselToBack = () => {
    setFlippedCarouselCards([]); 
    setCarouselHasFlipped(false); // Reset flipped flag
    clearTimeouts(carouselTimeoutsRef.current); 
    carouselTimeoutsRef.current = []; 
  };

  // Flip when visible
  useEffect(() => {
    if (!latestSectionRef.current || latestPosts.length === 0) return; // No posts -> Exit

    const observer = new IntersectionObserver( 
      (entries) => {
        entries.forEach((entry) => {
          clearTimeouts(latestTimeoutsRef.current);
          latestTimeoutsRef.current = [];
          
          if (entry.isIntersecting) { // Visible
            // Flip
            latestPosts.forEach((_, idx) => {
              const timeout = setTimeout(() => {
                setFlippedLatestCards(prev => {
                  if (prev.includes(idx)) return prev; // Don't flip if flipped
                  return [...prev, idx]; // Index to flipped array
                });
                // Last card flips = complete
                if (idx === latestPosts.length - 1) {
                  setTimeout(() => {
                    setFirstRowAnimationComplete(true); 
                  }, 500); // Wait 
                }
              }, idx * 80); // Delay by 80ms
              latestTimeoutsRef.current.push(timeout); // Store timeout for cleanup
            });
          } else { // Out of view
            setFlippedLatestCards([]); // Bback to og
          }
        });
      },
      { threshold: 0.2 } // Trigger when 20% visible
    );

    observer.observe(latestSectionRef.current); 
    return () => {
      observer.disconnect(); 
      clearTimeouts(latestTimeoutsRef.current); 
    };
  }, [latestPosts]); // Re-run 

  // Second row 
  useEffect(() => {
    if (latestPosts.length > 0 && !loading) { // If row 1 not loading
      const totalDelay = 400; // Delay 
      const timer = setTimeout(() => {
        setShowSecondRow(true); // Show 2nd row (carousel)
      }, totalDelay);
      return () => clearTimeout(timer); 
    } else if (latestPosts.length === 0) { // If no 1st row
      setShowSecondRow(true); // Show 2nd row 
      setFirstRowAnimationComplete(true); 
    }
  }, [latestPosts, loading]); // Re-run

  // Section visibility
  useEffect(() => {
    if (!showSecondRow || carouselPosts.length === 0) return; // Exit if no posts

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsCarouselVisible(entry.isIntersecting); 
          
          if (!entry.isIntersecting) { // Not visible
            resetCarouselToBack(); // Reset 
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );

    if (carouselSectionRef.current) {
      observer.observe(carouselSectionRef.current); 
    }

    return () => {
      observer.disconnect(); 
    };
  }, [showSecondRow, carouselPosts.length]); // Re-run

  const getVisibleCarouselIndices = () => {
    if (!scrollRef.current) return []; 
    
    const container = scrollRef.current;
    const containerRect = container.getBoundingClientRect(); 
    const visibleIndices: number[] = [];
    
    // Get carousel cards from DOM
    const cards = container.querySelectorAll('.carousel-card');
    
    cards.forEach((card, idx) => {
      if (idx >= carouselPosts.length) return;
      
      const cardRect = card.getBoundingClientRect();
      // Mow much card is visible
      const visibleWidth = Math.min(cardRect.right, containerRect.right) - Math.max(cardRect.left, containerRect.left);
      const totalWidth = cardRect.width;
      const visiblePercentage = visibleWidth / totalWidth; // % of visible
      
      // Visible if at least 30%
      if (visiblePercentage > 0.3) {
        visibleIndices.push(idx); 
      }
    });
    
    return visibleIndices; 
  };

  // Flip visible cards 
  const flipVisibleCarouselCards = () => {
    const visibleIndices = getVisibleCarouselIndices(); // Get current visible cards
    if (visibleIndices.length === 0) return; // Exit if none
    
    // Sort to flip (left to right)
    visibleIndices.sort((a, b) => a - b);
    
    clearTimeouts(carouselTimeoutsRef.current);
    carouselTimeoutsRef.current = [];
    
    // Flip sequentially
    visibleIndices.forEach((idx, order) => {
      const timeout = setTimeout(() => {
        setFlippedCarouselCards(prev => {
          if (prev.includes(idx)) return prev; 
          return [...prev, idx]; 
        });
      }, order * 100); // 100ms delay 
      carouselTimeoutsRef.current.push(timeout); 
    });
    
    setCarouselHasFlipped(true); // Mark as flipped
  };

  // Carousel posts flip
  useEffect(() => {
    if (!isCarouselVisible || !showSecondRow || carouselPosts.length === 0 || !firstRowAnimationComplete || carouselHasFlipped) return;

    // Delay for all cards to render
    const timer = setTimeout(() => {
      flipVisibleCarouselCards(); // Flip
    }, 100);

    return () => clearTimeout(timer); 
  }, [isCarouselVisible, showSecondRow, carouselPosts.length, firstRowAnimationComplete, carouselHasFlipped]); // Re-run

  // Scroll position changes 
  useEffect(() => {
    if (!scrollRef.current || !showSecondRow || !isCarouselVisible) return; // Exit if not met
    
    let scrollTimeout: NodeJS.Timeout; 
    let rafId: number; 
    
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId); // Cancel pending animation frame for "smooth handling" daw
      
      rafId = requestAnimationFrame(() => {
        clearTimeout(scrollTimeout); 
        
        updateButtonStates(); 
        
        scrollTimeout = setTimeout(() => {
          if (carouselHasFlipped && isCarouselVisible) { 
            const newVisibleIndices = getVisibleCarouselIndices(); 
            
            // Keep visible flipped cards
            setFlippedCarouselCards(prev => {
              const stillVisible = prev.filter(idx => newVisibleIndices.includes(idx));
              
              // Find unflipped visible cards
              const newlyVisible = newVisibleIndices.filter(idx => !stillVisible.includes(idx));
              
              if (newlyVisible.length > 0) {
                clearTimeouts(carouselTimeoutsRef.current);
                carouselTimeoutsRef.current = [];
                
                // Flip newly visible cards sequentially
                newlyVisible.sort((a, b) => a - b);
                newlyVisible.forEach((idx, order) => {
                  const timeout = setTimeout(() => {
                    setFlippedCarouselCards(current => {
                      if (current.includes(idx)) return current; // Skip if flipped
                      return [...current, idx]; // Add to flipped
                    });
                  }, order * 100); // 100ms delay 
                  carouselTimeoutsRef.current.push(timeout); 
                });
              }
              
              return stillVisible; // Keep still-visible cards
            });
          }
        }, 150); // Wait 150ms
      });
    };
    
    const scrollElement = scrollRef.current;
    scrollElement.addEventListener('scroll', handleScroll, { passive: true }); 
    
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout); 
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeouts(carouselTimeoutsRef.current); 
    };
  }, [showSecondRow, carouselHasFlipped, isCarouselVisible]); // Re-run

  // Check scroll position and update button states
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  // Scroll event listener
  const updateButtonStates = checkScrollPosition;

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement && carouselPosts.length > 0 && showSecondRow && isCarouselVisible && firstRowAnimationComplete) {
      const check = () => {
        checkScrollPosition(); 
        if (!carouselHasFlipped && isCarouselVisible && firstRowAnimationComplete) {
          flipVisibleCarouselCards();
        }
      };
      
      setTimeout(check, 150);
      window.addEventListener('resize', check); // Re-check
      
      return () => {
        window.removeEventListener('resize', check);
      };
    }
  }, [carouselPosts, showSecondRow, isCarouselVisible, firstRowAnimationComplete, carouselHasFlipped]); // Re-run when dependencies change

  // Horizontal scrolling for carousel
  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current && isCarouselVisible) { 
      const amount = 800; // Scroll distance
      const currentScroll = scrollRef.current.scrollLeft;
      const targetScroll = dir === 'left' ? currentScroll - amount : currentScroll + amount; 
      
      scrollRef.current.scrollTo({
        left: targetScroll, 
        behavior: 'smooth' // Smooth scrolling
      });
      
      // Reset flips
      resetCarouselToBack();
      
      // After scroll, flip new visible cards
      const checkScrollComplete = setInterval(() => {
        if (scrollRef.current) {
          const isScrolling = Math.abs(scrollRef.current.scrollLeft - targetScroll) > 10;
          if (!isScrolling) { 
            clearInterval(checkScrollComplete); // Stop checking
            setTimeout(() => {
              if (isCarouselVisible && firstRowAnimationComplete) {
                flipVisibleCarouselCards(); 
              }
            }, 100);
          }
        }
      }, 50); // Check every 50ms
      
      setTimeout(() => clearInterval(checkScrollComplete), 1000);
    }
  };

  // Loading spinner
  if (loading) {
    return (
      <div 
        className="w-full bg-[#fbfaf8] max-w-[1920px] min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
          backgroundSize: "20px 20px"
        }}
      >
        <div className="w-12 h-12 border-4 border-[#0d21a1] border-t-[#eec643] rounded-full animate-spin"></div> {/* Spinning loader */}
      </div>
    );
  }

  return (
    <div 
      className="w-full mx-auto bg-[#fbfaf8] max-w-[1920px] pt-12 px-4 md:px-8 lg:px-16 relative"
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: "20px 20px",
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Decorative blur elements at the sides */}
    <div className="absolute top-[50px] -translate-y-1/2 -left-10 w-96 h-96 bg-[#0d21a1]/15 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute top-[1000px] -translate-y-1/2 -right-48 w-96 h-96 bg-[#0d21a1]/15 rounded-full blur-3xl delay-1000 pointer-events-none" />
      
      {/* Heading */}
      <div className="text-center mb-6 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-5xl text-[#eec643]">♠</span>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#011638] to-[#0d21a1] bg-clip-text text-transparent tracking-tight">
            NEWS & MEDIA
          </h1>
          <span className="text-5xl text-[#eec643]">♠</span>
        </div>

        <div className="w-40 h-1 bg-gradient-to-r from-[#eec643] to-[#0d21a1] mx-auto rounded-full mt-3" />

        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Stay updated with the latest announcements and activities from ACE CARDS.
        </p>
      </div>

      {/* 1st ROW: Latest Posts */}
      {latestPosts.length > 0 && (
        <div ref={latestSectionRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 relative z-10"> 
          {latestPosts.map((post, idx) => (
            <div key={post.id} className="perspective-container h-[400px]">
              <FlippableNewsCard 
                post={post} 
                isFlipped={flippedLatestCards.includes(idx)}
                index={idx}
              />
            </div>
          ))}
        </div>
      )}

      {/* 2nd ROW: Carousel Section/Additional Posts */}
      {showSecondRow && carouselPosts.length > 0 && (
        <div ref={carouselSectionRef} className="relative z-10">
          {/* Sub heading */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-4xl text-[#eec643]">♠</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#011638]">More Updates</h2>
            <span className="text-4xl text-[#eec643]">♠</span>
          </div>

          {/* Carousel Container */}
          <div className="relative px-11 py-2">
            {/* Left Scroll Button */}
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-md transition-all ${
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
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-md transition-all ${
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
              className="flex overflow-x-auto overflow-y-visible gap-6 pb-5 hide-scrollbar"
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {carouselPosts.map((post, idx) => (
                <div key={post.id} className="flex-none w-80 py-2 perspective-container h-[400px] carousel-card">
                  <FlippableNewsCard 
                    post={post} 
                    isFlipped={flippedCarouselCards.includes(idx)}
                    index={idx + latestPosts.length}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* CSS */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .perspective-container {
          perspective: 1000px;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.05;
          }
          50% {
            opacity: 0.15;
          }
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}

// Indiv card with flip
function FlippableNewsCard({ 
  post, 
  isFlipped,
  index
}: { 
  post: NewsMedia;
  isFlipped: boolean;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  useEffect(() => {
    setIsCardFlipped(isFlipped);
  }, [isFlipped]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div 
      className="flip-card-wrapper"
      style={{ 
        animation: `cardFloat 0.3s ease-out ${Math.min(index * 0.05, 0.3)}s both` // Fade-in
      }}
    >
      <div 
        className={`flip-card ${isCardFlipped ? 'flipped' : ''}`}
        style={{ 
          transition: `transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)`
        }}
      >
        {/* Back of card */}
        <div className="flip-card-back">
          <div 
            className="rounded-lg overflow-hidden bg-gradient-to-br from-[#011638] to-[#0d21a1] flex flex-col items-center justify-center h-full shadow-md relative w-full text-center p-6"
            style={{ 
              backgroundImage: "url('/assets/logos/hero-bg.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-[#011638]/70 rounded-lg" />
            
            <div className="relative z-10 flex flex-col items-center justify-center">
              <img
                src="/assets/logos/ACE CARDS logo.png"
                alt="ACE CARDS Logo"
                className="w-32 h-32 object-contain mx-auto mb-5"
              />
              
              <h3 className="text-white font-bold text-xl mb-0 text-center">
                ACE CARDS
              </h3>
              
              <p className="text-[#eec643] text-sm font-semibold text-center">
                Latest Update
              </p>
            </div>
          </div>
        </div>

        {/* Front of card */}
        <div className="flip-card-front">
          <Link href={post.post_url} target="_blank" rel="noopener noreferrer" className="block h-full">
            <div className="rounded-lg overflow-hidden transition-all duration-300 bg-white flex flex-col h-full hover:shadow-xl hover:scale-[1.02] hover:z-10 shadow-md relative">
              {/* Image section */}
              <div className="h-48 rounded-t-lg overflow-hidden bg-gray-100 relative flex-shrink-0">
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
                {/* Date badge */}
                <div className="absolute top-3 right-3">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#0d21a1] shadow-lg">
                    {formatDate(post.fb_post_date)}
                  </span>
                </div>
              </div>

              {/* Content section */}
              <div className="p-4 flex-1 flex flex-col overflow-hidden">
                <h3 className="font-bold text-lg text-[#011638] mb-2 line-clamp-2 hover:text-[#0d21a1] transition-colors text-left min-h-[56px]">
                  {post.title}
                </h3>

                {post.content && (
                  <p className="text-gray-600 text-sm mb-0 line-clamp-2 text-left">
                    {post.content}
                  </p>
                )}

                {/* Read more link */}
                <div className="mt-auto flex items-center text-[#eec643] font-medium text-sm group pt-0">
                  <span>Read more</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* CSS for 3D flip */}
      <style jsx>{`
        .flip-card-wrapper {
          width: 100%;
          height: 100%;
          perspective: 1000px; /* 3D perspective parent */
        }
        
        .flip-card {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1); /* Smooth flip transition */
          transform-style: preserve-3d; /* Preserve 3D transformations */
          cursor: pointer; /* Show pointer cursor on hover */
        }
        
        .flip-card.flipped {
          transform: rotateY(180deg); /* Rotate card 180 degrees on Y axis */
        }
        
        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden; /* Hide back face when facing away */
          -webkit-backface-visibility: hidden; /* Safari support */
          border-radius: 0.5rem;
        }
        
        .flip-card-front {
          transform: rotateY(180deg); /* Front face is rotated - shows when flipped */
        }
        
        .flip-card-back {
          transform: rotateY(0deg); /* Back face is at default rotation */
        }
        
        @keyframes cardFloat {
          0% {
            opacity: 0;
            transform: translateY(20px); /* Start below */
          }
          100% {
            opacity: 1;
            transform: translateY(0); /* End at normal position */
          }
        }
      `}</style>
    </div>
  );
}