import { BlogPost } from '@/types/blog';
import { BlogCard } from '@/components/organisms';

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Find something for the occasion",
    excerpt:
      "If you can ship it, you can sell it. Your money funds real farmers, restaurants, and skilled workers. NOT venture capital. We continually find new points of sale for coalition members.",
    image: '/images/blog/post-1.jpg',
    category: 'ACCESSORIES',
    href: '#',
  },
  {
    id: 2,
    title: 'Every storefront belongs to an actual person or small team',
    excerpt: 'Working as a coalition means community growth. When we build with each other, we build community.',
    image: '/images/blog/post-2.jpg',
    category: 'STYLE GUIDE',
    href: '#',
  },
  {
    id: 3,
    title: 'Find local producers',
    excerpt: 'Local pickup hosting options are available for FREE.',
    image: '/images/blog/post-3.jpg',
    category: 'TRENDS',
    href: '#',
  },
];

export function BlogSection() {
  return (
    <section className='bg-tertiary container'>
      <div className='flex items-center justify-between mb-12'>
        <h2 className='heading-lg text-tertiary'>
          STAY UP TO DATE
        </h2>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3'>
        {blogPosts.map((post, index) => (
          <BlogCard
            key={post.id}
            index={index}
            post={post}
          />
        ))}
      </div>
    </section>
  );
}
