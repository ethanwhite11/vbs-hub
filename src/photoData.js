// ─── PHOTO DATA ───────────────────────────────────────────────────────────────
// Drop photos into public/photos/<folder>/ then update the src and caption below.
// src path = /photos/<folder>/<filename>   (must match the actual filename exactly)
// caption  = short label shown on the polaroid

export const PHOTO_DATA = {

  // ── VBS 2025 (shown on Day 1 before any current-week photos exist) ──────────
  // Drop files into: public/photos/lastYear/
  lastYear: [
    { id:'ly1', src:'/photos/lastYear/411_0280_DayCamp2025.jpg',       caption:'True North'  },
    { id:'ly2', src:'/photos/lastYear/411_0568_DayCamp2025.jpg',       caption:'True North'  },
    { id:'ly3', src:'/photos/lastYear/411_9732_DayCamp2025 (1).jpg',   caption:'True North'  },
    { id:'ly4', src:'/photos/lastYear/411_9932_DayCamp2025.jpg',       caption:'True North'  },
    { id:'ly5', src:'/photos/lastYear/DSC_2282_DayCamp2025.jpg',       caption:'True North'  },
    { id:'ly6', src:'/photos/lastYear/DSC_3063_DayCamp2025 (1).jpg',   caption:'True North'  },
    { id:'ly7', src:'/photos/lastYear/DSC_3260_DayCamp2025.jpg',       caption:'True North'  },
  ],

  // ── Monday (shown Tuesday morning) ─────────────────────────────────────────
  // Drop files into: public/photos/day1/
  1: [
    { id:'d1a', src:'/photos/day1/photo1.jpg', caption:'God is our creator'  },
    { id:'d1b', src:'/photos/day1/photo2.jpg', caption:'Crew time'           },
    { id:'d1c', src:'/photos/day1/photo3.jpg', caption:'Wild games'          },
    { id:'d1d', src:'/photos/day1/photo4.jpg', caption:'Memory verse'        },
  ],

  // ── Tuesday (shown Wednesday morning) ──────────────────────────────────────
  // Drop files into: public/photos/day2/
  2: [
    { id:'d2a', src:'/photos/day2/photo1.jpg', caption:'God knows everything' },
    { id:'d2b', src:'/photos/day2/photo2.jpg', caption:'Crew time'            },
    { id:'d2c', src:'/photos/day2/photo3.jpg', caption:'Wild games'           },
    { id:'d2d', src:'/photos/day2/photo4.jpg', caption:'Memory verse'         },
  ],

  // ── Wednesday (shown Thursday morning) ─────────────────────────────────────
  // Drop files into: public/photos/day3/
  3: [
    { id:'d3a', src:'/photos/day3/photo1.jpg', caption:'God is our safe place' },
    { id:'d3b', src:'/photos/day3/photo2.jpg', caption:'Crew time'             },
    { id:'d3c', src:'/photos/day3/photo3.jpg', caption:'Wild games'            },
    { id:'d3d', src:'/photos/day3/photo4.jpg', caption:'Memory verse'          },
  ],

  // ── Thursday (shown Friday morning) ────────────────────────────────────────
  // Drop files into: public/photos/day4/
  4: [
    { id:'d4a', src:'/photos/day4/photo1.jpg', caption:'God is love'  },
    { id:'d4b', src:'/photos/day4/photo2.jpg', caption:'Crew time'    },
    { id:'d4c', src:'/photos/day4/photo3.jpg', caption:'Wild games'   },
    { id:'d4d', src:'/photos/day4/photo4.jpg', caption:'Memory verse' },
  ],

}
