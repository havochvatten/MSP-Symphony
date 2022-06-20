import { Component } from '@angular/core';

@Component({
  selector: 'app-hav-loader',
  template: `
    <svg width="100px" id="el_LeUW1CNn2">
      <defs>
        <clipPath id="f95b9890-e00b-4ce8-a0cc-582d3f2eab93">
          <circle cx="50" cy="75" r="45.36" />
        </clipPath>
      </defs>
      <circle cx="50" cy="75" r="45.36" id="el_wc4FA0xngg" />
      <g id="el_cN_HRrkyxS">
        <g id="el_0YgI4KF2IU_an_ijmzz853O" data-animator-group="true" data-animator-type="0">
          <path
            d="M131.91,79.26,130,77.75l-1.79,1.65C122.94,84.28,115.34,87,106.83,87S90.71,84.28,85.44,79.4l-1.79-1.65-2.07,1.84c-5.27,4.87-12.86,7.56-21.38,7.56s-16.11-2.69-21.39-7.56L37,77.94l-1.91,1.51C25,87.43,9.35,89.64.25,84.55v6.3c10.56,4.21,25.61,2,36.5-5.53,6.18,4.87,14.41,7.53,23.45,7.53s17.27-2.66,23.44-7.53c6.18,4.87,14.14,7.34,23.19,7.34s17.26-2.66,23.44-7.52c10.89,7.56,25.94,9.73,36.5,5.53V84.36C157.67,89.45,142,87.24,131.91,79.26Z"
            id="el_0YgI4KF2IU"
          />
        </g>
      </g>
    </svg>
  `,
  styles: [
    `
      @keyframes kf_el_0YgI4KF2IU_an_ijmzz853O {
        0% {
          transform: translate(0.25px, 77.75px) translate(-0.25px, -77.75px) translate(-36px, 0px);
        }
        100% {
          transform: translate(0.25px, 77.75px) translate(-0.25px, -77.75px) translate(10px, 0px);
        }
      }
      #el_LeUW1CNn2 * {
        animation-duration: 0.5s;
        animation-iteration-count: infinite;
        animation-timing-function: cubic-bezier(0, 0, 1, 1);
      }
      #el_wc4FA0xngg {
        fill: #005f88;
      }
      #el_cN_HRrkyxS {
        clip-path: url(#f95b9890-e00b-4ce8-a0cc-582d3f2eab93);
      }
      #el_0YgI4KF2IU {
        fill: #e74e0f;
      }
      #el_0YgI4KF2IU_an_ijmzz853O {
        animation-fill-mode: backwards;
        transform: translate(0.25px, 77.75px) translate(-0.25px, -77.75px) translate(-10px, 0px);
        animation-name: kf_el_0YgI4KF2IU_an_ijmzz853O;
        animation-timing-function: cubic-bezier(0, 0, 1, 1);
      }
    `
  ]
})
export class HavLoaderComponent {}
