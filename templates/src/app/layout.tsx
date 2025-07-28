import { Head, Image } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import './global.css';

export const metadata = {
  metadataBase: new URL('https://nextra.site'),
  title: {
    template: '%s - Docs',
    absolute: 'Docs',
  },
  description: 'Docs',
  applicationName: 'Docs',
  generator: 'Next.js',
  appleWebApp: {
    title: 'Docs',
  },
  other: {
    'msapplication-TileImage': '/ms-icon-144x144.png',
    'msapplication-TileColor': '#fff',
  },
  twitter: {
    site: 'https://nextra.site',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navbar = (
    <Navbar
      logo={
        <div>
          <b>Docs</b> <span style={{ opacity: '60%' }}>Docs</span>
        </div>
      }
      chatIcon={
        <Image
          className="size-5"
          src={'/assets/gitlab-logo.png'}
          alt={'logo'}
        />
      }
      chatLink="https://gitlab.itcjf.com/fex/docs/biz-doc-tcloan-sweb"
    />
  );
  const pageMap = await getPageMap();
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="✦" />
      <body>
        <Layout
          banner={
            <div className="flex w-full items-center justify-center bg-blue-500/10 py-2 text-white">
              <p>Docs</p>
            </div>
          }
          navbar={navbar}
          footer={<Footer>MIT {new Date().getFullYear()}</Footer>}
          editLink="Edit this page on GitLab"
          feedback={{
            content: 'feedback',
          }}
          docsRepositoryBase="https://gitlab.itcjf.com/fex/docs/biz-doc-design-sweb/tree/master"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={pageMap}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
