'use client';

import { LinkbApp } from '@linkbcms/core/app';
import cmsConfig from '@/cms.config';
import '@linkbcms/core/styles';
export function CMSPage() {
  return <LinkbApp config={cmsConfig} />;
}
