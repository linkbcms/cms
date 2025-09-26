'use client';

import { CMSPage } from '@linkbcms/core-tsdown';
import '@linkbcms/core-tsdown/styles';
import { cmsConfig } from '@/../cms.config';

export default function Page() {
  return <CMSPage config={cmsConfig} />;
}
