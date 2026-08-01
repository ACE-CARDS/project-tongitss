//https://www.letsbuildui.dev/articles/how-to-build-a-card-flip-animation/
"use client";

import { useState, useEffect, useRef, useCallback } from "react"; 
import Link from "next/link"; 
import { createClient } from '@/utils/supabase/client';
import { BsSuitSpadeFill } from "react-icons/bs";
import GradientLine from "@/components/ui/gradientLine";

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
  const [firstRowAnimationComplete, setFirstRowAnimationComplete] = useState(false); 
  const [showContent, setShowContent] = useState(false);
  const [isCarouselVisible, setIsCarouselVisible] = useState(false); 
  const latestSectionRef = useRef<HTMLDivElement>(null);
  const carouselSectionRef = useRef<HTMLDivElement>(null); 
  
  // Timeout IDs
  const latestTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const carouselTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  
  // Refs for flip control
  const isFlippingRef = useRef(false);
  const flipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingFlipsRef = useRef<number[]>([]);

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
      // Delay
      setTimeout(() => {
        setShowContent(true);
      }, 0.1);
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

  // Flip when visible
  useEffect(() => {
    if (!latestSectionRef.current || latestPosts.length === 0) return; // No posts -> Exit

    const observer = new IntersectionObserver( 
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { // Visible
          // Flip
          const cardsToFlip = latestPosts.map((_, idx) => idx).filter(idx => !flippedLatestCards.includes(idx));
          
          cardsToFlip.forEach((idx) => {
            const timeout = setTimeout(() => {
              setFlippedLatestCards(prev => {
                if (prev.includes(idx)) return prev;
                return [...prev, idx];
              });
              if (idx === latestPosts.length - 1) {
                setTimeout(() => {
                  setFirstRowAnimationComplete(true);
                }, 500);
              }
            }, idx * 80);
            latestTimeoutsRef.current.push(timeout);
          });
        }
      });
    },
    { threshold: 0.2 }
  );

    observer.observe(latestSectionRef.current); 
    return () => {
      observer.disconnect(); 
      clearTimeouts(latestTimeoutsRef.current); 
    };
  }, [latestPosts, flippedLatestCards]); // Re-run 

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
      // Check if card is visible
      const isVisible = (
        cardRect.left < containerRect.right &&
        cardRect.right > containerRect.left &&
        cardRect.bottom > containerRect.top &&
        cardRect.top < containerRect.bottom
      );
      
      // Additional check for how much is visible
      if (isVisible) {
        const visibleWidth = Math.min(cardRect.right, containerRect.right) - Math.max(cardRect.left, containerRect.left);
        const totalWidth = cardRect.width;
        const visiblePercentage = visibleWidth / totalWidth;
        
        // Visible if at least 20% is showing
        if (visiblePercentage > 0.2) {
          visibleIndices.push(idx);
        }
      }
    });
    
    return visibleIndices; 
  };

  // Flip visible cards
  const flipVisibleCarouselCards = (flippedState: number[] = flippedCarouselCards) => {
    if (isFlippingRef.current) return;
    
    const visibleIndices = getVisibleCarouselIndices();
    if (visibleIndices.length === 0) return;
    
    const unflippedIndices = visibleIndices.filter(idx => !flippedState.includes(idx));
    if (unflippedIndices.length === 0) return;
    
    isFlippingRef.current = true;
    
    clearTimeouts(carouselTimeoutsRef.current);
    carouselTimeoutsRef.current = [];
    
    pendingFlipsRef.current = unflippedIndices;
    
    unflippedIndices.forEach((idx, order) => {
      const timeout = setTimeout(() => {
        setFlippedCarouselCards(prev => {
          // Double-check we haven't already flipped this card
          if (prev.includes(idx)) return prev;
          
          // Remove from pending
          pendingFlipsRef.current = pendingFlipsRef.current.filter(i => i !== idx);
          
          // Check if this is the last one
          if (pendingFlipsRef.current.length === 0) {
            setTimeout(() => {
              isFlippingRef.current = false;
            }, 100);
          }
          
          return [...prev, idx];
        });
      }, order * 60); 
      carouselTimeoutsRef.current.push(timeout);
    });
    
    setTimeout(() => {
      if (isFlippingRef.current) {
        isFlippingRef.current = false;
        pendingFlipsRef.current = [];
      }
    }, 1000);
  };

  // Carousel posts flip
  useEffect(() => {
    if (!isCarouselVisible || !showSecondRow || carouselPosts.length === 0 || !firstRowAnimationComplete) {
      return;
    }

    if (flipTimeoutRef.current) {
      clearTimeout(flipTimeoutRef.current);
      flipTimeoutRef.current = null;
    }

    // Small delay to ensure DOM is ready
    flipTimeoutRef.current = setTimeout(() => {
      flipVisibleCarouselCards();
      flipTimeoutRef.current = null;
    }, 300);

    return () => {
      if (flipTimeoutRef.current) {
        clearTimeout(flipTimeoutRef.current);
        flipTimeoutRef.current = null;
      }
    };
  }, [isCarouselVisible, showSecondRow, carouselPosts.length, firstRowAnimationComplete]);

  // Check scroll position and update button states
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      const hasOverflow = scrollWidth > clientWidth;
      const newCanScrollLeft = scrollLeft > 5;

      const remainingScroll = scrollWidth - (scrollLeft + clientWidth);
      const newCanScrollRight = hasOverflow && remainingScroll > 5;
      
      setCanScrollLeft(newCanScrollLeft);
      setCanScrollRight(newCanScrollRight);
    }
  };

  // Update button states on mount and resize
  useEffect(() => {
    if (!showSecondRow || carouselPosts.length === 0) return;

    const setup = () => {
      const container = scrollRef.current;

      if (!container) {
        requestAnimationFrame(setup);
        return;
      }

      console.log("Attached!");

      checkScrollPosition();

      const resizeObserver = new ResizeObserver(checkScrollPosition);
      resizeObserver.observe(container);

      const cards = container.querySelectorAll(".carousel-card");
      cards.forEach(card => resizeObserver.observe(card));

      window.addEventListener("resize", checkScrollPosition);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", checkScrollPosition);
      };
    };

    const cleanup = setup();

    return () => {
      if (cleanup) cleanup();
    };
  }, [showSecondRow, carouselPosts.length]);

  // Scroll position changes 
  useEffect(() => {
    if (!scrollRef.current || !showSecondRow || !isCarouselVisible) return;
    
    let scrollTimeout: NodeJS.Timeout; 
    let rafId: number; 
    
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        clearTimeout(scrollTimeout); 
        
        // Update button states
        checkScrollPosition(); 
        
        scrollTimeout = setTimeout(() => {
          if (isCarouselVisible && !isFlippingRef.current) { 

            setFlippedCarouselCards(currentFlipped => {
              const visibleIndices = getVisibleCarouselIndices();
              const unflippedIndices = visibleIndices.filter(idx => !currentFlipped.includes(idx));
              
              if (unflippedIndices.length > 0) {
                clearTimeouts(carouselTimeoutsRef.current);
                carouselTimeoutsRef.current = [];
                
                isFlippingRef.current = true;
                pendingFlipsRef.current = unflippedIndices;
                
                unflippedIndices.forEach((idx, order) => {
                  const timeout = setTimeout(() => {
                    setFlippedCarouselCards(prev => {
                      if (prev.includes(idx)) return prev;
                      pendingFlipsRef.current = pendingFlipsRef.current.filter(i => i !== idx);
                      
                      if (pendingFlipsRef.current.length === 0) {
                        setTimeout(() => {
                          isFlippingRef.current = false;
                        }, 100);
                      }
                      
                      return [...prev, idx];
                    });
                  }, order * 60);
                  carouselTimeoutsRef.current.push(timeout);
                });
                
                setTimeout(() => {
                  if (isFlippingRef.current) {
                    isFlippingRef.current = false;
                    pendingFlipsRef.current = [];
                  }
                }, 1000);
              }
              
              return currentFlipped;
            });
          }
        }, 150);
      });
    };
    
    const scrollElement = scrollRef.current;
    scrollElement.addEventListener('scroll', handleScroll, { passive: true }); 
    
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout); 
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeouts(carouselTimeoutsRef.current); 
      isFlippingRef.current = false;
      pendingFlipsRef.current = [];
    };
  }, [showSecondRow, isCarouselVisible]);

  // Horizontal scrolling for carousel
  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) { 
      const container = scrollRef.current;
      const cards = container.querySelectorAll('.carousel-card');
      
      if (cards.length === 0) return;
      
      // Get scroll position
      const currentScrollLeft = container.scrollLeft;
      const cardWidth = cards[0]?.getBoundingClientRect().width || 0;
      const gap = 20;
      const scrollAmount = cardWidth + gap;
      
      let newScrollLeft;
      if (dir === 'left') {
        newScrollLeft = Math.max(0, currentScrollLeft - scrollAmount);
      } else {
        newScrollLeft = Math.min(container.scrollWidth - container.clientWidth, currentScrollLeft + scrollAmount);
      }
      
      // Smooth scroll
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      // Flip new visible cards
      setTimeout(() => {
        if (isCarouselVisible && firstRowAnimationComplete && !isFlippingRef.current) {
          // Get current flipped state
          setFlippedCarouselCards(currentFlipped => {
            const visibleIndices = getVisibleCarouselIndices();
            const unflippedIndices = visibleIndices.filter(idx => !currentFlipped.includes(idx));
            
            if (unflippedIndices.length > 0) {
              clearTimeouts(carouselTimeoutsRef.current);
              carouselTimeoutsRef.current = [];
              
              isFlippingRef.current = true;
              pendingFlipsRef.current = unflippedIndices;
              
              unflippedIndices.forEach((idx, order) => {
                const timeout = setTimeout(() => {
                  setFlippedCarouselCards(prev => {
                    if (prev.includes(idx)) return prev;
                    pendingFlipsRef.current = pendingFlipsRef.current.filter(i => i !== idx);
                    
                    if (pendingFlipsRef.current.length === 0) {
                      setTimeout(() => {
                        isFlippingRef.current = false;
                      }, 100);
                    }
                    
                    return [...prev, idx];
                  });
                }, order * 60);
                carouselTimeoutsRef.current.push(timeout);
              });
              
              setTimeout(() => {
                if (isFlippingRef.current) {
                  isFlippingRef.current = false;
                  pendingFlipsRef.current = [];
                }
              }, 1000);
            }
            
            return currentFlipped;
          });
        }
        setTimeout(checkScrollPosition, 100);
      }, 400);
    }
  };

  // Loading
  if (!showContent) {
  return (
    <div 
      className="w-full bg-[#fbfaf8] max-w-[1920px] min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
        backgroundSize: "20px 20px"
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <BsSuitSpadeFill className="absolute top-[2%] left-[5%] rotate-12 size-20 md:size-37 text-[#0d21a1]/10" />
        <BsSuitSpadeFill className="absolute top-[5%] left-[25%] -rotate-12 size-16 md:size-24 text-[#0d21a1]/10" />
        <BsSuitSpadeFill className="absolute top-[8%] left-[75%] -rotate-15 size-18 md:size-28 text-[#0d21a1]/10" />
        <BsSuitSpadeFill className="absolute top-[1%] left-[92%] rotate-20 size-22 md:size-34 text-[#0d21a1]/10" />
        <BsSuitSpadeFill className="absolute top-[60%] left-[1%] rotate-15 size-32 md:size-52 text-[#0d21a1]/10" />
        <BsSuitSpadeFill className="absolute top-[40%] right-[3%] rotate-10 size-30 md:size-55 text-[#0d21a1]/10" />
        <BsSuitSpadeFill className="absolute top-[86%] right-[4%] rotate-18 size-20 md:size-40 text-[#0d21a1]/10" />
        <BsSuitSpadeFill className="absolute top-[47%] left-[59%] -rotate-30 size-15 md:size-30 text-[#0d21a1]/10" />
        <BsSuitSpadeFill className="absolute top-[45%] left-[20%] rotate-35 size-20 md:size-45 text-[#0d21a1]/10" />
      </div>
    </div>
  );
}

  return (
    <div 
      className="w-full mx-auto bg-[#fbfaf8] max-w-[1920px] pt-12 px-4 pb-[50px] md:px-8 lg:px-16 relative overflow-x-hidden"
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: "20px 20px",
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Evenly Distributed Spades */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top Row */}
        <BsSuitSpadeFill className="absolute top-[2%] left-[5%] rotate-12 size-20 md:size-37 text-[#0d21a1]/10" />
        <BsSuitSpadeFill className="absolute top-[5%] left-[25%] -rotate-12 size-16 md:size-24 text-[#0d21a1]/10" />
        <BsSuitSpadeFill className="absolute top-[8%] left-[75%] -rotate-15 size-18 md:size-28 text-[#0d21a1]/10" />
        <BsSuitSpadeFill className="absolute top-[1%] left-[92%] rotate-20 size-22 md:size-34 text-[#0d21a1]/10" />

        {/* Middle-Left Area */}
        <BsSuitSpadeFill className="absolute top-[60%] left-[1%] rotate-15 size-32 md:size-52 text-[#0d21a1]/10" />

        {/* Middle-Right Area */}
        <BsSuitSpadeFill className="absolute top-[40%] right-[3%] rotate-10 size-30 md:size-55 text-[#0d21a1]/10" />
        <BsSuitSpadeFill className="absolute top-[86%] right-[4%] rotate-18 size-20 md:size-40 text-[#0d21a1]/10" />

        {/* Center Area */}
        <BsSuitSpadeFill className="absolute top-[47%] left-[59%] -rotate-30 size-15 md:size-30 text-[#0d21a1]/10" />
                
        {/* Between Posts Areas */}
        <BsSuitSpadeFill className="absolute top-[45%] left-[20%] rotate-35 size-20 md:size-45 text-[#0d21a1]/10" />
      </div>
      
      {/* Heading */}
      <div className="text-center mb-6 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="header withspade">
            NEWS & MEDIA
          </span>
        </div>

        <GradientLine />

        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Stay updated with the latest announcements and activities from ACE CARDS.
        </p>
      </div>

      {/* 1st ROW: Latest Posts */}
      {latestPosts.length > 0 && (
        <div ref={latestSectionRef} className="mb-12 relative z-10">
          <div className="news-grid">
            {latestPosts.map((post, idx) => (
              <div 
                key={post.id} 
                className="perspective-container"
              >
                <FlippableNewsCard 
                  post={post} 
                  isFlipped={flippedLatestCards.includes(idx)}
                  index={idx}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2nd ROW: Carousel Section/Additional Posts */}
      {showSecondRow && carouselPosts.length > 0 && (
        <div ref={carouselSectionRef} className="relative z-10">
          {/* Sub heading */}
          <div className="flex items-center justify-center gap-3 mb-6 z-10">
            <span className="headersub withminispade">
              More Updates
            </span>
          </div>

          {/* Carousel Container */}
          <div className="relative w-full py-2">
            {/* Left Scroll Button */}
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 rounded-full p-2 shadow-md transition-all duration-300 ${
                canScrollLeft 
                  ? 'bg-[#011638] hover:bg-[#0d21a1] hover:shadow-lg cursor-pointer opacity-100' 
                  : 'bg-gray-300 cursor-not-allowed opacity-60'
              }`}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px'
              }}
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Scroll Button */}
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-20 rounded-full p-2 shadow-md transition-all duration-300 ${
                canScrollRight 
                  ? 'bg-[#011638] hover:bg-[#0d21a1] hover:shadow-lg cursor-pointer opacity-100' 
                  : 'bg-gray-300 cursor-not-allowed opacity-60'
              }`}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px'
              }}
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scrollable Cards Container */}
            <div
              ref={scrollRef}
              className="flex overflow-x-auto overflow-y-visible gap-4 sm:gap-5 pb-8 hide-scrollbar snap-mandatory px-8 sm:px-10"
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                scrollSnapType: 'x mandatory',
                scrollPaddingLeft: 'calc(50% - 160px)',
                scrollPaddingRight: 'calc(50% - 160px)',
                paddingBottom: '32px',
                paddingTop: '5px'
              }}
            >
              {carouselPosts.map((post, idx) => (
                <div 
                  key={post.id} 
                  className="flex-none carousel-card snap-center"
                  style={{
                    width: '100%',
                    minWidth: '280px',
                    maxWidth: '90vw',
                    scrollSnapAlign: 'center',
                    height: 'auto',
                    minHeight: '380px'
                  }}
                >
                  <FlippableNewsCard 
                    post={post} 
                    isFlipped={true}
                    index={idx + latestPosts.length}
                    isCarouselCard={true}
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
          width: 100%;
          height: 100%;
        }
        
        /* Cards to be responsive */
        .carousel-card {
          height: auto !important;
          min-height: 360px;
          scroll-snap-align: center;
          scroll-snap-stop: always;
        }
        
        /* Smooth scrolling container */
        .flex.overflow-x-auto {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scroll-snap-type: x mandatory;
        }
        
        .news-grid {
          display: grid;
          gap: 1.5rem;
          width: 100%;
        }
        
        /* Mobile styles */
        @media (max-width: 640px) {
          .news-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .news-grid > div {
            width: 100%;
            max-width: 100%;
            min-height: 320px;
          }
          
          .perspective-container {
            min-height: 320px;
          }
          
          .carousel-card {
            min-width: 260px !important;
            max-width: 85vw !important;
          }
          
          /* Make cards more compact on mobile */
          .flip-card-front .rounded-lg,
          .flip-card-back .rounded-lg {
            min-height: 320px;
          }
          
          .flip-card-front h3 {
            font-size: 1rem !important;
            min-height: 48px !important;
          }
          
          .flip-card-front .h-48 {
            height: 160px !important;
          }
        }
        
        /* Tablet styles */
        @media (min-width: 641px) and (max-width: 1023px) {
          .news-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
            padding: 0 0.5rem;
          }
          
          .news-grid > div {
            width: 100%;
            min-width: 0;
          }
          
          .perspective-container {
            min-height: 380px;
          }
          
          .flip-card-front .rounded-lg {
            min-height: 380px;
          }
          
          .flip-card-front h3 {
            font-size: 1.125rem !important;
            min-height: 56px !important;
          }
          
          .flip-card-front .h-48 {
            height: 180px !important;
          }
          
          .news-grid > div:last-child:nth-child(3) {
            grid-column: span 2;
            max-width: 450px;
            width: 100%;
            justify-self: center;
          }
          
          .carousel-card {
            min-width: 280px !important;
            max-width: 75vw !important;
          }
        }
        
        /* Desktop styles */
        @media (min-width: 1024px) {
          .news-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }
          
          .news-grid > div {
            width: 100%;
          }
          
          .perspective-container {
            min-height: 420px;
          }
          
          .carousel-card {
            min-width: 320px !important;
            max-width: 320px !important;
          }
        }
        
        /* Large desktop */
        @media (min-width: 1280px) {
          .carousel-card {
            min-width: 340px !important;
            max-width: 340px !important;
          }
        }
        
        /* Responsive image container */
        .image-container {
          width: 100%;
          overflow: hidden;
        }

        @media (max-width: 640px) {
          .image-container {
            height: 160px !important;
          }
        }

        @media (min-width: 641px) and (max-width: 768px) {
          .image-container {
            height: 170px !important;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .image-container {
            height: 180px !important;
          }
        }

        @media (min-width: 1025px) {
          .image-container {
            height: 192px !important;
          }
        }
        
        /* Button positioning and hover effects */
        button[aria-label="Scroll left"],
        button[aria-label="Scroll right"] {
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
          z-index: 30 !important;
          transition: all 0.3s ease;
        }

        button[aria-label="Scroll left"]:hover:not(:disabled),
        button[aria-label="Scroll right"]:hover:not(:disabled) {
          transform: scale(1.05) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
        }
        
        /* Card content improvements */
        .flip-card-front .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Proper spacing */
        .relative.z-10 {
          width: 100%;
          overflow-x: visible;
        }
        
        /* Carousel container padding */
        .relative.w-full.py-2 {
          padding-left: 2rem !important;
          padding-right: 2rem !important;
        }
        
        @media (max-width: 640px) {
          .relative.w-full.py-2 {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}

// Indiv card with flip
function FlippableNewsCard({ 
  post, 
  isFlipped,
  index,
  isCarouselCard = false
}: { 
  post: NewsMedia;
  isFlipped: boolean;
  index: number;
  isCarouselCard?: boolean;
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
        animation: `cardFloat 0.3s ease-out ${Math.min(index * 0.05, 0.3)}s both`, // Fade-in
        width: '100%',
        height: '100%'
      }}
    >
      <div 
        className={`flip-card ${isCardFlipped ? 'flipped' : ''}`}
        style={{ 
          transition: `transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)`,
          width: '100%',
          height: '100%'
        }}
      >
        {/* Back of card */}
        <div className="flip-card-back">
          <div 
            className="rounded-lg overflow-hidden bg-gradient-to-br from-[#011638] to-[#0d21a1] flex flex-col items-center justify-center h-full shadow-md relative w-full text-center p-4 sm:p-6"
            style={{ 
              backgroundImage: "url('/assets/logos/card-bg.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '320px'
            }}
          >
            <div className="absolute inset-0 bg-[#011638]/50 rounded-lg" />
            
            <div className="relative z-10 flex flex-col items-center justify-center">
              <img
                src="/assets/logos/ACE CARDS logo.png"
                alt="ACE CARDS Logo"
                className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain mx-auto mb-3 sm:mb-5"
              />
              
              <h3 className="text-white font-bold text-lg sm:text-xl mb-0 text-center">
                ACE CARDS
              </h3>
              
              <p className="text-[#eec643] text-xs sm:text-sm font-semibold text-center">
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
              <div className="image-container h-40 sm:h-44 md:h-48 rounded-t-lg overflow-hidden bg-gray-100 relative flex-shrink-0">
                {(!post.image_url || imgError) ? ( 
                  <div className="w-full h-full flex items-center justify-center bg-[#011638]">
                    <img
                      src="/assets/logos/ACE CARDS logo.png"
                      alt="ACE CARDS Logo"
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain opacity-80"
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
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <span className="bg-white/90 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium text-[#0d21a1] shadow-lg">
                    {formatDate(post.fb_post_date)}
                  </span>
                </div>
              </div>

              {/* Separator */}
              <div className="relative w-full px-2">
                <div className="h-[1px] bg-gradient-to-r from-transparent via-[#011638]/80 to-transparent shadow-sm"></div>
              </div>

              {/* Content section */}
              <div className="p-3 sm:p-4 flex-1 flex flex-col overflow-hidden">
                {/* Title */}
                <h3 
                  className={`font-bold text-base sm:text-lg text-[#011638] mb-2 hover:text-[#0d21a1] transition-colors text-left [word-break:break-word] whitespace-normal line-clamp-2`}
                  title={post.title}
                >
                  {post.title}
                </h3>

                {post.content && (
                  <p className={`text-gray-600 text-xs sm:text-sm mb-0 text-left [word-break:break-word] whitespace-normal ${
                    isCarouselCard ? 'line-clamp-2' : 'line-clamp-3'
                  }`}>
                    {post.content}
                  </p>
                )}

                {/* Read more link */}
                <div className="mt-auto ml-auto flex items-center text-[#0d21a1] font-medium text-xs sm:text-sm group pt-2">
                  <span>Read more</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* CSS */}
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
        
        /* Text clamping */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-break: break-word;
          white-space: normal;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-break: break-word;
          white-space: normal;
        }
        
        h3.line-clamp-2,
        h3.line-clamp-3 {
          word-break: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
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