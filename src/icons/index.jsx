import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const I = ({ children, size = 20, color = 'currentColor', strokeWidth = 1.6 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          stroke: color,
          strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        });
      }
      return child;
    })}
  </Svg>
);

export const IconDashboard = (p) => (
  <I {...p}>
    <Rect x="3" y="3" width="7" height="9" rx="1.5" />
    <Rect x="14" y="3" width="7" height="5" rx="1.5" />
    <Rect x="14" y="12" width="7" height="9" rx="1.5" />
    <Rect x="3" y="16" width="7" height="5" rx="1.5" />
  </I>
);

export const IconHospital = (p) => (
  <I {...p}>
    <Path d="M4 21V8l8-4 8 4v13" />
    <Path d="M9 21v-5h6v5" />
    <Path d="M12 8v5M9.5 10.5h5" />
  </I>
);

export const IconUsers = (p) => (
  <I {...p}>
    <Circle cx="9" cy="8" r="3.2" />
    <Path d="M3 20c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5" />
    <Circle cx="17" cy="9" r="2.4" />
    <Path d="M15 14.5c3 .2 5.5 2.4 5.5 5" />
  </I>
);

export const IconShield = (p) => (
  <I {...p}>
    <Path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
    <Path d="M9 12l2 2 4-4" />
  </I>
);

export const IconGlobe = (p) => (
  <I {...p}>
    <Circle cx="12" cy="12" r="10" />
    <Path d="M2 12h20" />
    <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </I>
);

export const IconPulse = (p) => (
  <I {...p}>
    <Path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </I>
);

export const IconPlus = (p) => (
  <I {...p}>
    <Path d="M12 5v14M5 12h14" />
  </I>
);

export const IconAlert = (p) => (
  <I {...p}>
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 8v4" />
    <Path d="M12 16h.01" />
  </I>
);

export const IconUser = (p) => (
  <I {...p}>
    <Circle cx="12" cy="7" r="4" />
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  </I>
);

export const IconUserPlus = (p) => (
  <I {...p}>
    <Path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <Circle cx="8.5" cy="7" r="4" />
    <Path d="M20 8v6M23 11h-6" />
  </I>
);

export const IconLock = (p) => (
  <I {...p}>
    <Rect x="3" y="11" width="18" height="11" rx="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </I>
);

export const IconEye = (p) => (
  <I {...p}>
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <Circle cx="12" cy="12" r="3" />
  </I>
);

export const IconEyeOff = (p) => (
  <I {...p}>
    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <Path d="M1 1l22 22" />
  </I>
);

export const IconMenu = (p) => (
  <I {...p}>
    <Path d="M3 12h18M3 6h18M3 18h18" />
  </I>
);

export const IconFilter = (p) => (
  <I {...p}>
    <Path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
  </I>
);

export const IconMail = (p) => (
  <I {...p}>
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <Path d="M22 6l-10 7L2 6" />
  </I>
);

export const IconLocation = (p) => (
  <I {...p}>
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <Circle cx="12" cy="10" r="3" />
  </I>
);

export const IconPhone = (p) => (
  <I {...p}>
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </I>
);

export const IconSettings = (p) => (
  <I {...p}>
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </I>
);

export const IconSearch = (p) => (
  <I {...p}>
    <Circle cx="11" cy="11" r="7" />
    <Path d="M21 21l-4.3-4.3" />
  </I>
);

export const IconBuilding = (p) => (
  <I {...p}>
    <Rect x="4" y="2" width="16" height="20" rx="2" />
    <Path d="M9 22v-4h6v4" />
    <Path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
  </I>
);

export const IconChevron = (p) => (
  <I {...p}>
    <Path d="M9 18l6-6-6-6" />
  </I>
);

export const IconLogout = (p) => (
  <I {...p}>
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </I>
);

export const IconMoon = (p) => (
  <I {...p}>
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </I>
);

export const IconGateway = (p) => (
  <I {...p}>
    <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </I>
);

export const IconBed = (p) => (
  <I {...p}>
    <Path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v-4" />
  </I>
);

export const IconDoor = (p) => (
  <I {...p}>
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Path d="M9 22V12h6v10" />
  </I>
);

export const IconEdit = (p) => (
  <I {...p}>
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </I>
);

export const IconTrash = (p) => (
  <I {...p}>
    <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </I>
);

export const IconClock = (p) => (
  <I {...p}>
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 6v6l4 2" />
  </I>
);

export const IconCalendar = (p) => (
  <I {...p}>
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <Path d="M16 2v4M8 2v4M3 10h18" />
  </I>
);

export const IconCheck = (p) => (
  <I {...p}>
    <Path d="M20 6L9 17l-5-5" />
  </I>
);

export const IconHeart = (p) => (
  <I {...p}>
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </I>
);

export const IconDownload = (p) => (
  <I {...p}>
    <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </I>
);

export const IconChart = (p) => (
  <I {...p}>
    <Path d="M4 20V4" />
    <Path d="M4 20h16" />
    <Rect x="7" y="12" width="3" height="6" rx=".5" />
    <Rect x="12" y="8" width="3" height="10" rx=".5" />
    <Rect x="17" y="14" width="3" height="4" rx=".5" />
  </I>
);

export const IconBell = (p) => (
  <I {...p}>
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </I>
);

export const IconPause = (p) => (
  <I {...p}>
    <Rect x="6" y="4" width="4" height="16" />
    <Rect x="14" y="4" width="4" height="16" />
  </I>
);

export const IconKey = (p) => (
  <I {...p}>
    <Path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zM12 2l.792.792a.5.5 0 0 1 0 .707L11.5 4.793a.5.5 0 0 0 0 .707l.707.707a.5.5 0 0 0 .707 0l2-2a.5.5 0 0 1 .707 0l.707.707a.5.5 0 0 1 0 .707L15 7.043a.5.5 0 0 0 0 .707l.707.707a.5.5 0 0 0 .707 0l3.143-3.143a.5.5 0 0 1 .707 0L22 7" />
  </I>
);

export const IconStethoscope = (p) => (
  <I {...p}>
    <Path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
    <Path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
    <Circle cx="20" cy="10" r="2" />
  </I>
);

export const IconPatient = (p) => (
  <I {...p}>
    <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
    <Path d="M19 8l-1.5 1.5L16 8" />
  </I>
);

export const IconCpu = (p) => (
  <I {...p}>
    <Rect x="4" y="4" width="16" height="16" rx="2" />
    <Path d="M9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
  </I>
);

export const IconActivity = (p) => (
  <I {...p}>
    <Path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </I>
);

export const IconBack = (p) => (
  <I {...p}>
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </I>
);

export const IconWifi = (p) => (
  <I {...p}>
    <Path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
  </I>
);
