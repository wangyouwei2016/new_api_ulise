/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

export const CONSOLE_NOIR_THEME = {
  id: 'console-noir',
  name: 'Console Noir',
  version: '1.0.0',
  /** Toggle this flag to switch between Console Noir and the default home page. */
  enabled: true,
  /** Hide the version indicator next to the top-left brand logo. */
  hideBrandVersion: true,
  /** Default gateway endpoint shown on the homepage and client config snippets. */
  gatewayUrl: 'https://api.weigeai.com',
  /** Default display & color mode for first-time visitors. */
  defaultThemeMode: 'light' as const,
  defaultCrtEnabled: false,
  /** Interval (ms) between automatic channel switches in the hero console. */
  autoCycleChannelsMs: 5500,
} as const
