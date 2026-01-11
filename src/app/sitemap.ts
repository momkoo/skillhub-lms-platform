import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://skillhub.vercel.app';

    // 정적 페이지들
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/courses`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/instructors`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    // TODO: 동적 페이지 (강의 상세 등) 추가
    // const courses = await fetchCourses();
    // const coursePages = courses.map(course => ({
    //   url: `${baseUrl}/courses/${course.id}`,
    //   lastModified: course.updatedAt,
    //   changeFrequency: 'weekly' as const,
    //   priority: 0.7,
    // }));

    return staticPages;
}
