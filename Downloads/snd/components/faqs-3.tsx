// FAQs-3.tsx

'use client'

import { Database, Lock, Link2, TrendingUp, UserCog } from 'lucide-react'
import Link from 'next/link'

type FAQItem = {
    id: string;
    icon: string;
    question: string;
    answer: string;
};

export default function FAQsThree() {
    const faqItems: FAQItem[] = [
        {
            id: 'item-1',
            icon: 'database',
            question: 'What data is included in the student profile?',
            answer: 'The profiles include academic records (grades, test scores), attendance logs, behavioral notes, engagement metrics, and personalized intervention plans, offering a holistic view of the student.',
        },
        {
            id: 'item-2',
            icon: 'lock',
            question: 'How is student data privacy ensured?',
            answer: 'We comply with FERPA and other global data privacy standards. All data is encrypted, access is strictly role-based (teachers only see their students), and secure multi-factor authentication is required for all users.',
        },
        {
            id: 'item-3',
            icon: 'link',
            question: 'Can the tracker integrate with our existing LMS?',
            answer: 'Yes, our tracker uses a secure API to integrate seamlessly with major Learning Management Systems (LMS) and Student Information Systems (SIS) like Moodle, Canvas, and PowerSchool for automatic data synchronization.',
        },
        {
            id: 'item-4',
            icon: 'trending-up',
            question: 'How accurate are the predictive analytics?',
            answer: 'Our predictive models are trained on aggregated, anonymized student performance data, achieving over 90% accuracy in flagging students who show patterns of academic risk. However, predictions require human oversight.',
        },
        {
            id: 'item-5',
            icon: 'user-cog',
            question: 'Who can view and edit a student profile?',
            answer: 'Access is controlled by user roles: Teachers can view and update their assigned students. Administrators have full access across the institution. Parents and students can only view limited, approved data.',
        },
    ];

    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'database':
                return <Database className="m-auto size-4" />;
            case 'lock':
                return <Lock className="m-auto size-4" />;
            case 'link':
                return <Link2 className="m-auto size-4" />;
            case 'trending-up':
                return <TrendingUp className="m-auto size-4" />;
            case 'user-cog':
                return <UserCog className="m-auto size-4" />;
            default:
                return null;
        }
    };

    return (
        <section className="bg-muted dark:bg-background py-20">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="flex flex-col gap-10 md:flex-row md:gap-16">
                    <div className="md:w-1/3">
                        <div className="sticky top-20">
                            <h2 className="mt-4 text-3xl font-bold">Frequently Asked Questions</h2>
                            <p className="text-muted-foreground mt-4">
                                Can't find what you're looking for? Check our extensive{' '}
                                <Link
                                    href="#"
                                    className="text-primary font-medium hover:underline">
                                    Help Center
                                </Link>
                            </p>
                        </div>
                    </div>
                    <div className="md:w-2/3">
                        <div className="w-full space-y-2">
                            {faqItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-background shadow-xs rounded-lg border px-4 last:border-b"
                                >
                                    <div className="flex items-center justify-between py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-6">
                                                {getIconComponent(item.icon)}
                                            </div>
                                            <span className="text-base font-medium">{item.question}</span>
                                        </div>
                                        <svg
                                            className="h-5 w-5 text-gray-500 transition-transform duration-200"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </div>
                                    <div className="pb-5">
                                        <div className="px-9">
                                            <p className="text-base">{item.answer}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}