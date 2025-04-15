export const ChevronDownIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const EyeIcon = () => (
    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5Z"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path
            d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const EyeOffIcon = () => (
    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C17 4 21.27 7.61 23 12C22.18 13.53 21.02 14.83 19.6 15.82M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.572 9.14351 13.1984C8.99262 12.8248 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58525 10.1546 9.88 9.88M1 1L23 23M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C7 20 2.73 16.39 1 12C2.63 8.9 5.28 6.37 8.47 5.06L17.94 17.94Z"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// Chicken Down SVG Icon
export const ChickenDown = ({ className }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 512"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
        fill="#000000" stroke="none">
        <path d="M823 4796 c-278 -71 -447 -344 -378 -611 44 -166 185 -312 343 -354
        l42 -12 0 -104 0 -105 450 0 450 0 0 104 0 104 53 17 c348 112 459 549 207
        814 -106 110 -218 156 -380 155 -117 -1 -196 -21 -282 -75 l-48 -29 -47 31
        c-102 64 -294 95 -410 65z"/>
        <path d="M655 3296 c-41 -18 -83 -69 -89 -109 -3 -18 -7 -64 -10 -103 -12
        -151 -67 -295 -234 -612 -133 -252 -183 -362 -232 -512 -70 -210 -96 -394 -87
        -615 24 -567 273 -997 702 -1212 347 -175 804 -175 1150 -1 162 82 330 226
        437 375 276 385 344 968 173 1474 -21 61 -111 255 -220 474 -204 408 -230 478
        -245 654 -9 110 -19 134 -74 175 -27 21 -39 21 -634 23 -489 2 -613 0 -637
        -11z"/>
       </g>
    </svg>
  );
  
  // Chicken Up SVG Icon
  export const ChickenUp = ({ className }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 512"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
        fill="#000000" stroke="none">
        <path d="M1130 5113 c-19 -2 -71 -11 -115 -19 -500 -99 -872 -490 -979 -1029
        -61 -309 -45 -594 51 -890 42 -131 94 -247 251 -557 175 -344 222 -479 222
        -632 0 -68 30 -127 79 -154 l40 -22 610 2 c598 3 610 3 637 24 55 41 65 65 74
        175 16 187 60 304 259 684 213 405 284 626 298 930 7 158 -10 361 -34 413 -39
        83 -147 104 -236 45 -88 -57 -180 -52 -258 15 -62 53 -89 119 -89 216 0 142
        -47 189 -191 191 -104 2 -160 25 -218 91 -70 80 -75 172 -15 266 28 43 34 62
        34 106 0 47 -4 57 -37 92 -31 32 -49 42 -92 50 -51 9 -215 11 -291 3z"/>
        <path d="M830 1406 l0 -104 -52 -17 c-296 -96 -432 -433 -286 -708 85 -159
        269 -267 457 -267 78 0 201 33 275 73 l61 34 71 -39 c353 -190 774 50 774 440
        0 128 -51 245 -149 343 -68 68 -133 108 -209 128 l-42 12 0 104 0 105 -450 0
        -450 0 0 -104z"/>
       </g>
    </svg>
  );