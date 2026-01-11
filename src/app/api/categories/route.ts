import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        const { data: categories, error } = await supabase
            .from('skillhub_categories')
            .select('*')
            .order('name');

        if (error) throw error;

        // Add dummy color/icon mapping if they are not in DB columns yet
        // In a real app, these should be columns or mapped on frontend
        const enhancedCategories = categories.map((cat: any, index: number) => {
            const colors = ['coral', 'sage', 'blue', 'amber', 'rose', 'emerald', 'indigo'];
            const icons = ['code', 'chart', 'design', 'business', 'language', 'finance', 'media'];
            return {
                ...cat,
                color: colors[index % colors.length],
                icon: icons[index % icons.length],
                count: '0+' // Placeholder until we have counts
            };
        });

        return NextResponse.json(enhancedCategories);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
