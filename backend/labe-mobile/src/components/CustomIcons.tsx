import React from 'react';
import Svg, { Path, G, Circle, Rect } from 'react-native-svg';


export const AddIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Add */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Circle cx="64" cy="64" r="42"/><Path d="M64 42v44M42 64h44"/></G>
  </Svg>
);

export const ActivityIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Activity */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Path d="M16 64h24l12-32 24 64 12-32h24"/></G>
  </Svg>
);

export const BookingsIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Bookings */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Rect x="25" y="27" width="78" height="76" rx="10"/><Path d="M25 49h78M43 18v18M85 18v18M45 65h1M64 65h1M83 65h1M45 82h1M64 82h1"/></G>
  </Svg>
);

export const BrandLogoIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Brand Logo */}<Path d="M32 22v57c0 17 10 27 27 27 19 0 31-13 31-32V62h15c6 0 10-4 10-10H82c-14 0-25 10-25 24 0 5 2 10 5 14-3 3-7 5-11 5-7 0-11-4-11-12V22H32Z"/><Path d="M78 34c8-8 18-12 32-12h6c0 10-5 17-16 17H86c-7 0-13 2-18 6 2-5 5-8 10-11Z"/><Path d="M72 49c5-5 9-8 14-10l7 17H80l-8-7Z"/><Path d="M72 63h30c0 7-4 11-11 11H72c-7 0-13 3-17 8 1-12 7-19 17-19Z"/><Path d="M78 88h28c7 0 10 4 10 10H68l10-10Z"/>
  </Svg>
);

export const CheckIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Check */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Path d="m30 66 22 22 46-50"/></G>
  </Svg>
);

export const CloseIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Close */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Path d="m40 40 48 48M88 40 40 88"/></G>
  </Svg>
);

export const DeleteIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Delete */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Path d="M31 38h66M49 38V25h30v13M40 38l5 70h38l5-70"/></G>
  </Svg>
);

export const EditIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Edit */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Path d="m30 91-5 18 18-5 54-54a12 12 0 0 0-17-17zM71 39l18 18"/></G>
  </Svg>
);

export const FavoritesIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Favorites */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Path d="M64 103S25 80 25 51c0-14 10-25 24-25 8 0 13 4 15 10 3-6 8-10 16-10 14 0 23 11 23 25 0 29-39 52-39 52Z"/></G>
  </Svg>
);

export const FilterIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Filter */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Path d="M22 30h84L74 64v30l-20 8V64z"/></G>
  </Svg>
);

export const HelpIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Help */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Circle cx="64" cy="64" r="43"/><Path d="M51 49c2-9 8-14 17-14 10 0 17 6 17 15 0 8-4 12-11 16-6 3-8 6-8 12M64 91h1"/></G>
  </Svg>
);

export const HomeCollectionIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Home Collection */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Path d="M18 61 64 24l46 37M28 55v49h72V55M52 104V76h24v28M64 51v20M54 61h20"/></G>
  </Svg>
);

export const HomeIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Home */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Path d="M18 58 64 20l46 38"/><Path d="M28 52v52h72V52"/><Path d="M52 104V76h24v28"/></G>
  </Svg>
);

export const LabsIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Labs */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Path d="M45 20h38M51 20v26l-25 43a11 11 0 0 0 10 16h56a11 11 0 0 0 10-16L77 46V20M43 78h42"/></G>
  </Svg>
);

export const MenuIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Menu */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Path d="M25 38h78M25 64h78M25 90h78"/></G>
  </Svg>
);

export const NearbyIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Nearby */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Path d="M64 111s33-31 33-58a33 33 0 1 0-66 0c0 27 33 58 33 58Z"/><Circle cx="64" cy="53" r="8"/></G>
  </Svg>
);

export const NotificationsIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Notifications */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Path d="M31 82h66l-8-11V51c0-15-10-26-25-26S39 36 39 51v20zM53 96c2 7 7 10 11 10s9-3 11-10"/></G>
  </Svg>
);

export const OrdersIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Orders */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Path d="M28 42h72l-7 61H35zM43 42a21 21 0 0 1 42 0"/></G>
  </Svg>
);

export const PaymentsIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Payments */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Rect x="20" y="29" width="88" height="70" rx="10"/><Path d="M20 50h88M36 76h22"/></G>
  </Svg>
);

export const ProfileIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Profile */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Circle cx="64" cy="40" r="18"/><Path d="M29 105c4-23 16-34 35-34s31 11 35 34"/></G>
  </Svg>
);

export const ReportsIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Reports */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Path d="M34 16h42l18 18v78H34zM76 16v20h18M48 58h32M48 73h32M48 88h22"/></G>
  </Svg>
);

export const SearchIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Search */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Circle cx="55" cy="55" r="27"/><Path d="m76 76 25 25"/></G>
  </Svg>
);

export const SettingsIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Settings */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Circle cx="64" cy="64" r="15"/><Path d="M64 18v15M64 95v15M18 64h15M95 64h15M31 31l11 11M86 86l11 11M97 31 86 42M42 86 31 97"/></G>
  </Svg>
);

export const ShareIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Share */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Path d="M64 82V22M64 22 42 44M64 22l22 22M29 65v39h70V65"/></G>
  </Svg>
);

export const TestsIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* Tests */}<G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><Path d="M50 20h28M56 20v24L33 91a11 11 0 0 0 10 17h42a11 11 0 0 0 10-17L72 44V20M43 79h42"/></G>
  </Svg>
);

export const LpgIcon = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 128 128" fill="none" {...props}>
    {/* LPG Flame / Cylinder */}
    <G stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
      {/* Cylinder body */}
      <Rect x="32" y="48" width="64" height="62" rx="10"/>
      {/* Cylinder top cap */}
      <Path d="M44 48V36a20 20 0 0 1 40 0v12"/>
      {/* Valve on top */}
      <Path d="M52 36h24M64 28v8"/>
      {/* Flame inside */}
      <Path d="M64 100c-10 0-16-6-16-16 0-8 6-12 8-18 2 4 4 6 8 6 4 0 6-2 8-6 2 6 8 10 8 18 0 10-6 16-16 16z"/>
    </G>
  </Svg>
);
