'use client';

import { LinkbApp } from '@linkbcms/core/app';
import cmsConfig from '@/cms.config';
import '@linkbcms/core/styles';
export default function CMSPage() {
  // return null;

  console.log(cmsConfig);
  return <LinkbApp config={cmsConfig} />;
}
