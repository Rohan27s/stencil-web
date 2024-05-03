import React from 'react';

const HamburgerIcon = (props) => (
  <React.Fragment>
    <svg
      width="32"
      height="33"
      viewBox="0 0 32 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M26.6667 23.8537C27.1803 23.8539 27.6742 24.0518 28.0459 24.4062C28.4176 24.7607 28.6387 25.2445 28.6634 25.7576C28.6881 26.2706 28.5145 26.7735 28.1785 27.1619C27.8425 27.5504 27.3699 27.7948 26.8587 27.8443L26.6667 27.8537H5.33337C4.81975 27.8534 4.32591 27.6556 3.95419 27.3011C3.58247 26.9467 3.36136 26.4628 3.33668 25.9498C3.31199 25.4368 3.48563 24.9339 3.82161 24.5454C4.15759 24.1569 4.63015 23.9126 5.14137 23.863L5.33337 23.8537H26.6667ZM26.6667 14.5203C27.1971 14.5203 27.7058 14.7311 28.0809 15.1061C28.456 15.4812 28.6667 15.9899 28.6667 16.5203C28.6667 17.0508 28.456 17.5595 28.0809 17.9346C27.7058 18.3096 27.1971 18.5203 26.6667 18.5203H5.33337C4.80294 18.5203 4.29423 18.3096 3.91916 17.9346C3.54409 17.5595 3.33337 17.0508 3.33337 16.5203C3.33337 15.9899 3.54409 15.4812 3.91916 15.1061C4.29423 14.7311 4.80294 14.5203 5.33337 14.5203H26.6667ZM26.6667 5.18701C27.1971 5.18701 27.7058 5.39773 28.0809 5.7728C28.456 6.14787 28.6667 6.65658 28.6667 7.18701C28.6667 7.71744 28.456 8.22615 28.0809 8.60123C27.7058 8.9763 27.1971 9.18701 26.6667 9.18701H5.33337C4.80294 9.18701 4.29423 8.9763 3.91916 8.60123C3.54409 8.22615 3.33337 7.71744 3.33337 7.18701C3.33337 6.65658 3.54409 6.14787 3.91916 5.7728C4.29423 5.39773 4.80294 5.18701 5.33337 5.18701H26.6667Z"
        fill={props.color}
      />
    </svg>
  </React.Fragment>
);

export default HamburgerIcon;
