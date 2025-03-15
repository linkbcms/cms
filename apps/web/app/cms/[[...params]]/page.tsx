'use client'

import { LinkbApp } from '@linkb/core/app'
import cmsConfig from 'cms.config'

export default function CMSPage() {
  return <LinkbApp config={cmsConfig} />
}
