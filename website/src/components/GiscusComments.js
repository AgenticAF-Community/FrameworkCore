import React from 'react';
import Giscus from '@giscus/react';
import { useColorMode } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function GiscusComments({ term }) {
  const { colorMode } = useColorMode();
  const { siteConfig } = useDocusaurusContext();
  const giscus = siteConfig.customFields?.giscus;

  if (!giscus) return null;

  return (
    <div className="giscus-sidebar">
      <div className="giscus-sidebar__heading">Discussion</div>
      <div className="giscus-sidebar__note">Sign in with GitHub to comment</div>
      <Giscus
        repo={giscus.repo}
        repoId={giscus.repoId}
        category={giscus.category}
        categoryId={giscus.categoryId}
        mapping={giscus.mapping || 'title'}
        strict={giscus.strict || '0'}
        reactionsEnabled={giscus.reactionsEnabled || '1'}
        emitMetadata="0"
        inputPosition="top"
        theme={colorMode === 'dark' ? 'dark' : 'light_high_contrast'}
        lang="en"
        loading="lazy"
        term={term}
      />
    </div>
  );
}
