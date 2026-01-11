interface JsonLdProps {
    type: 'Organization' | 'Course' | 'WebSite' | 'BreadcrumbList';
    data: Record<string, unknown>;
}

export default function JsonLd({ type, data }: JsonLdProps) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': type,
        ...data,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

// 사용 예시:
// <JsonLd
//   type="Organization"
//   data={{
//     name: 'SkillHub',
//     url: 'https://skillhub.vercel.app',
//     logo: 'https://skillhub.vercel.app/logo.png',
//   }}
// />
