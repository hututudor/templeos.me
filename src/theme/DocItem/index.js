/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useState } from "react";
import clsx from "clsx";
import DocPaginator from "@theme/DocPaginator";
import DocVersionBanner from "@theme/DocVersionBanner";
import DocVersionBadge from "@theme/DocVersionBadge";
import DocItemFooter from "@theme/DocItemFooter";
import TOC from "@theme/TOC";
import TOCCollapsible from "@theme/TOCCollapsible";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
  useWindowSize,
} from "@docusaurus/theme-common";
import DocBreadcrumbs from "@theme/DocBreadcrumbs";
import MDXContent from "@theme/MDXContent";

function DocItemMetadata(props) {
  const { content: DocContent } = props;
  const { metadata, frontMatter, assets } = DocContent;
  const { keywords } = frontMatter;
  const { description, title } = metadata;
  const image = assets.image ?? frontMatter.image;

  return (
    <PageMetadata
      {...{
        title,
        description,
        keywords,
        image,
      }}
    />
  );
}

function DocItemContent(props) {
  const { content: DocContent } = props;
  const { metadata, frontMatter } = DocContent;
  const {
    hide_title: hideTitle,
    hide_table_of_contents: hideTableOfContents,
    toc_min_heading_level: tocMinHeadingLevel,
    toc_max_heading_level: tocMaxHeadingLevel,
  } = frontMatter;
  const { title } = metadata; // We only add a title if:
  // - user asks to hide it with front matter
  // - the markdown content does not already contain a top-level h1 heading

  const shouldAddTitle =
    !hideTitle && typeof DocContent.contentTitle === "undefined";
  const windowSize = useWindowSize();
  const canRenderTOC =
    !hideTableOfContents && DocContent.toc && DocContent.toc.length > 0;
  const renderTocDesktop =
    canRenderTOC && (windowSize === "desktop" || windowSize === "ssr");

  console.log({ DocContent });

  return (
    <div className="row">
      <div className={clsx("col", !hideTableOfContents && styles.docItemCol)}>
        <DocVersionBanner />
        <div className={styles.docItemContainer}>
          <article>
            <DocBreadcrumbs />
            <DocVersionBadge />

            {canRenderTOC && (
              <TOCCollapsible
                toc={DocContent.toc}
                minHeadingLevel={tocMinHeadingLevel}
                maxHeadingLevel={tocMaxHeadingLevel}
                className={clsx(
                  ThemeClassNames.docs.docTocMobile,
                  styles.tocMobile
                )}
              />
            )}

            <div className={clsx(ThemeClassNames.docs.docMarkdown, "markdown")}>
              {/*
               Title can be declared inside md content or declared through
               front matter and added manually. To make both cases consistent,
               the added title is added under the same div.markdown block
               See https://github.com/facebook/docusaurus/pull/4882#issuecomment-853021120
               */}
              {shouldAddTitle && (
                <header>
                  <Heading as="h1">{title}</Heading>
                </header>
              )}
              <MDXContent>
                <DocContent />
              </MDXContent>
            </div>

            {frontMatter && <AuthorDisplay author={frontMatter?.author} />}
            <DocItemFooter {...props} />
          </article>

          <DocPaginator previous={metadata.previous} next={metadata.next} />
        </div>
      </div>
      {renderTocDesktop && (
        <div className="col col--3">
          <TOC
            toc={DocContent.toc}
            minHeadingLevel={tocMinHeadingLevel}
            maxHeadingLevel={tocMaxHeadingLevel}
            className={ThemeClassNames.docs.docTocDesktop}
          />
        </div>
      )}
    </div>
  );
}

export default function DocItem(props) {
  const docHtmlClassName = `docs-doc-id-${props.content.metadata.unversionedId}`;
  return (
    <HtmlClassNameProvider className={docHtmlClassName}>
      <DocItemMetadata {...props} />
      <DocItemContent {...props} />
    </HtmlClassNameProvider>
  );
}

function AuthorDisplay({ author }) {
  const [data, setData] = useState(null);
  const [isFetching, setFetching] = useState(true);

  useEffect(() => {
    const _fetch = async () => {
      setFetching(true);

      const res = await fetch(`https://api.github.com/users/${author}`);

      if (!res.ok) {
        setFetching(false);
        return;
      }

      const data = await res.json();
      setData(data);
      setFetching(false);
    };

    _fetch();
  }, []);

  if (isFetching || !data) {
    return <></>;
  }

  const handleAuthorClick = () => {
    window.open(`https://github.com/${author}`, "_blank");
  };

  return (
    <div className={styles.authorWrapper}>
      <div className={styles.authorBox} onClick={handleAuthorClick}>
        <img src={data.avatar_url} />
        <div>
          <span>Written by</span>
          <span className={styles.authorName}>{data.login}</span>
        </div>
      </div>
    </div>
  );
}
