declare module 'next-pwa' {
  import { NextConfig } from 'next'

  interface PWAConfig {
    dest?: string
    register?: boolean
    skipWaiting?: boolean
    disable?: boolean
    sw?: string
    scope?: string
    runtimeCaching?: any[]
    publicExcludes?: string[]
    buildExcludes?: string[]
    cacheOnFrontEndNav?: boolean
    reloadOnOnline?: boolean
    cacheStartUrl?: boolean
    dynamicStartUrl?: boolean
    dynamicStartUrlRedirect?: string
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig
  export default withPWA
}
