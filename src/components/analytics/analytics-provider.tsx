"use client";

import React, { useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { ANALYTICS_CONFIG, trackPageView } from "@/lib/analytics";

export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track pageviews dynamically on route changes
  useEffect(() => {
    if (pathname) {
      const url = searchParams?.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  return (
    <>
      {/* Search Console & Merchant Center Verification Meta */}
      {ANALYTICS_CONFIG.gscVerification && (
        <meta name="google-site-verification" content={ANALYTICS_CONFIG.gscVerification} />
      )}
      {ANALYTICS_CONFIG.gmcVerification && (
        <meta name="google-merchant-site-verification" content={ANALYTICS_CONFIG.gmcVerification} />
      )}

      {/* 1. Google Analytics 4 (GA4) */}
      {ANALYTICS_CONFIG.ga4Id && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.ga4Id}`}
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${ANALYTICS_CONFIG.ga4Id}', {
                  page_path: window.location.pathname,
                  send_page_view: true
                });
              `,
            }}
          />
        </>
      )}

      {/* 2. Microsoft Clarity (Heatmaps & Screen Recordings) */}
      {ANALYTICS_CONFIG.clarityId && (
        <Script
          id="clarity-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${ANALYTICS_CONFIG.clarityId}");
            `,
          }}
        />
      )}

      {/* 3. Meta Pixel (Facebook Pixel) */}
      {ANALYTICS_CONFIG.metaPixelId && (
        <Script
          id="meta-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${ANALYTICS_CONFIG.metaPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* 4. Pinterest Tag */}
      {ANALYTICS_CONFIG.pinterestTagId && (
        <Script
          id="pinterest-tag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(e){if(!window.pintrk){window.pintrk=function(){
              window.pintrk.queue.push(Array.prototype.slice.call(arguments))};
              var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");
              t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];
              r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
              pintrk('load', '${ANALYTICS_CONFIG.pinterestTagId}');
              pintrk('page');
            `,
          }}
        />
      )}
    </>
  );
}
