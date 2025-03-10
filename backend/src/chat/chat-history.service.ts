import { Injectable, Logger } from '@nestjs/common';

import { DrizzleDb, InjectDrizzle } from '@database';

import { MessageDto } from './dto/message.dto';
import { ThreadDto } from './dto/thread.dto';

@Injectable()
export class ChatHistoryService {
  private readonly logger = new Logger('ChatHistoryService');

  constructor(
    @InjectDrizzle()
    private readonly db: DrizzleDb,
  ) {}

  getAllThreads(): ThreadDto[] {
    const threads = [
      {
        id: '1',
        title: 'Analysis of Q4 financial reports with focus on revenue growth',
        messages: [
          {
            id: '1-1',
            content:
              "Let's analyze the Q4 financial reports, focusing particularly on revenue growth trends.",
            author: 'user' as const,
            timestamp: new Date('2025-03-09T10:30:00').toISOString(),
          },
          {
            id: '1-2',
            content:
              'The year-over-year revenue growth shows a 15% increase, primarily driven by our enterprise segment.',
            author: 'assistant' as const,
            timestamp: new Date('2025-03-09T10:35:00').toISOString(),
          },
          {
            id: '1-3',
            content: 'Can we break down the growth by product line?',
            author: 'user' as const,
            timestamp: new Date('2025-03-09T10:40:00').toISOString(),
          },
          {
            id: '1-4',
            content:
              'SaaS products: +22%, Hardware: +8%, Professional Services: +12%',
            author: 'assistant' as const,
            timestamp: new Date('2025-03-09T10:42:00').toISOString(),
          },
          {
            id: '1-5',
            content:
              'These numbers look promising. What about customer acquisition costs?',
            author: 'user' as const,
            timestamp: new Date('2025-03-09T14:40:00').toISOString(),
          },
          {
            id: '1-6',
            content:
              'CAC decreased by 5% compared to Q3, showing improved marketing efficiency.',
            author: 'assistant' as const,
            timestamp: new Date('2025-03-09T14:45:00').toISOString(),
          },
        ] as MessageDto[],
        messageCount: 6,
        createdAt: new Date('2025-03-09T10:30:00'),
        lastMessageAt: new Date('2025-03-09T14:45:00'),
      },
      {
        id: '2',
        title: 'Technical documentation review for the new API endpoints',
        messages: Array.from({ length: 17 }, (_, i) => ({
          id: `2-${i + 1}`,
          content: [
            "I've completed the initial draft of the API documentation. Please review.",
            'The authentication endpoints look good, but we need more examples.',
            'Should we add rate limiting information to the docs?',
            "Yes, good point. I'll add a section on rate limits.",
            'The response schemas need more detail.',
            'Updated the error handling section with more specific status codes.',
            'Can we add curl examples for each endpoint?',
            'Added curl examples. Also included Python and JavaScript snippets.',
            'The pagination parameters need clarification.',
            'Updated pagination docs with limit and offset examples.',
            'Should we document the beta endpoints separately?',
            "Yes, I'll create a separate section for beta features.",
            'The webhook documentation needs more detail on payload formats.',
            'Added detailed webhook payload examples.',
            'Can we add a section about environment setup?',
            'Documentation for websocket endpoints is missing.',
            "I'll add the websocket documentation by EOD.",
          ][i],
          author: i % 2 === 0 ? 'user' : ('assistant' as const),
          timestamp: new Date(
            new Date('2025-03-08T09:15:00').getTime() + i * 1000 * 60 * 25,
          ).toISOString(),
        })) as MessageDto[],
        messageCount: 17,
        createdAt: new Date('2025-03-08T09:15:00'),
        lastMessageAt: new Date('2025-03-08T16:20:00'),
      },
      {
        id: '3',
        title: 'Marketing strategy brainstorming session notes',
        messages: Array.from({ length: 22 }, (_, i) => ({
          id: `3-${i + 1}`,
          content: [
            "Let's brainstorm our Q2 marketing strategy.",
            'We should focus on social media presence.',
            'What platforms are our target audience using most?',
            'LinkedIn and Twitter show highest engagement rates.',
            'We could launch a thought leadership campaign.',
            'Good idea. What topics should we cover?',
            'Industry trends and AI implementation case studies.',
            'We should also consider influencer partnerships.',
            "What's our budget for influencer marketing?",
            'Current budget is $50K for Q2.',
            'We need to improve our email marketing metrics.',
            'Current open rate is 18%, industry average is 22%.',
            "Let's A/B test different subject line formats.",
            'Content calendar needs updating for Q2.',
            'Should we increase podcast advertising?',
            'Podcast ROI has been strong last quarter.',
            'What about hosting our own webinar series?',
            'Great idea! Monthly technical deep-dives?',
            'We need better landing pages for campaigns.',
            "I'll work on conversion optimization.",
            "Let's set up weekly progress tracking.",
            "I'll create a dashboard for marketing KPIs.",
          ][i],
          author: i % 2 === 0 ? 'user' : ('assistant' as const),
          timestamp: new Date(
            new Date('2025-03-08T13:00:00').getTime() + i * 1000 * 60 * 7,
          ).toISOString(),
        })) as MessageDto[],
        messageCount: 22,
        createdAt: new Date('2025-03-08T13:00:00'),
        lastMessageAt: new Date('2025-03-08T15:30:00'),
      },
      {
        id: '4',
        title: 'Customer feedback summary from recent product launch',
        messages: [
          {
            id: '4-1',
            content:
              "Here's the initial feedback from our product launch survey.",
            author: 'user' as const,
            timestamp: new Date('2025-03-07T11:45:00').toISOString(),
          },
          {
            id: '4-2',
            content:
              '85% users rated the new interface as "very intuitive". Main complaint is loading time on the dashboard.',
            author: 'assistant' as const,
            timestamp: new Date('2025-03-07T11:45:00').toISOString(),
          },
          {
            id: '4-3',
            content:
              'We should prioritize optimization of dashboard loading in the next sprint.',
            author: 'user' as const,
            timestamp: new Date('2025-03-07T11:45:00').toISOString(),
          },
        ] as MessageDto[],
        messageCount: 3,
        createdAt: new Date('2025-03-07T11:45:00'),
        lastMessageAt: new Date('2025-03-07T11:45:00'),
      },
      {
        id: '5',
        title: 'Project timeline and milestone planning discussion',
        messages: Array.from({ length: 8 }, (_, i) => ({
          id: `5-${i + 1}`,
          content: [
            "Let's review our Q2 project milestones.",
            'Phase 1 development is scheduled for April 15th.',
            'QA team needs at least 2 weeks for testing.',
            'Should we push the release date to May 1st?',
            'Yes, that gives us more buffer for unexpected issues.',
            "I'll update the project timeline in Jira.",
            "Don't forget to account for the security audit.",
            'Updated timeline has been shared with stakeholders.',
          ][i],
          author: i % 2 === 0 ? 'user' : ('assistant' as const),
          timestamp: new Date('2025-03-07T11:45:00').toISOString(),
        })) as MessageDto[],
        messageCount: 8,
        createdAt: new Date('2025-03-07T11:45:00'),
        lastMessageAt: new Date('2025-03-07T11:45:00'),
      },
      {
        id: '6',
        title: 'Bug report analysis for the mobile app version 2.1',
        messages: Array.from({ length: 31 }, (_, i) => ({
          id: `6-${i + 1}`,
          content: [
            'Critical bug reported: app crashes on startup for iOS 15 users.',
            'Investigating the crash logs now.',
            'Found the issue - memory leak in the initialization process.',
            'Can you share the stack trace?',
            'Posted stack trace in the thread.',
            'Another bug: push notifications not working on Android 12.',
            'This seems related to the new permission model.',
            'Testing the fix for iOS crash.',
            'Fix confirmed working on iOS 15.',
            'Deploying hotfix to TestFlight.',
            'Android notification bug needs more investigation.',
            'Found compatibility issue with Firebase SDK.',
            'Updating Firebase dependencies.',
            'New bug reported: infinite loading on profile page.',
            'Reproduced the infinite loading issue.',
            'Cache invalidation problem identified.',
            'Implementing cache fix.',
            'Testing cache fix on staging.',
            'Cache fix working, but introduced new bug in photo upload.',
            'Rolling back cache changes for now.',
            'New approach: implementing progressive loading.',
            'Progressive loading working well in testing.',
            'Deploying to beta channel.',
            'Beta users reporting improved performance.',
            'Found edge case in offline mode.',
            'Implementing offline fallback.',
            'All critical bugs resolved.',
            'Running final regression tests.',
            'Preparing release notes.',
            'Version 2.1.1 ready for submission.',
            'App store submission completed.',
          ][i],
          author: i % 2 === 0 ? 'user' : ('assistant' as const),
          timestamp: new Date(
            new Date('2025-03-07T11:45:00').getTime() + i * 1000 * 60 * 5,
          ).toISOString(),
        })) as MessageDto[],
        messageCount: 31,
        createdAt: new Date('2025-03-07T11:45:00'),
        lastMessageAt: new Date('2025-03-07T11:45:00'),
      },
      {
        id: '7',
        title: 'Team meeting notes about upcoming feature releases',
        messages: Array.from({ length: 14 }, (_, i) => ({
          id: `7-${i + 1}`,
          content: [
            "Let's review the features planned for next release.",
            'First up: enhanced analytics dashboard.',
            'Timeline estimate for analytics dashboard?',
            'Development: 2 weeks, Testing: 1 week.',
            'Next feature: custom report builder.',
            'Do we have the UI mockups ready?',
            'Yes, design team shared them yesterday.',
            'What about the export functionality?',
            'PDF and Excel exports are priority.',
            'We should add CSV export as well.',
            'Resource requirements for these features?',
            'Need two more frontend developers.',
            "I'll start the recruitment process.",
            "Let's schedule weekly progress reviews.",
          ][i],
          author: i % 2 === 0 ? 'user' : ('assistant' as const),
          timestamp: new Date('2025-03-07T11:45:00').toISOString(),
        })) as MessageDto[],
        messageCount: 14,
        createdAt: new Date('2025-03-07T11:45:00'),
        lastMessageAt: new Date('2025-03-07T11:45:00'),
      },
      {
        id: '8',
        title: 'Vendor comparison for cloud infrastructure services',
        messages: Array.from({ length: 11 }, (_, i) => ({
          id: `8-${i + 1}`,
          content: [
            'Starting vendor comparison between AWS, Azure, and GCP.',
            'AWS pricing for our workload: $12,000/month.',
            'Azure comes in at $10,500/month.',
            'GCP estimate: $11,200/month.',
            'Need to consider managed service offerings.',
            'AWS has better container orchestration.',
            'Azure integrates better with our existing tools.',
            'What about support response times?',
            'AWS Enterprise Support: 15min response time.',
            'Azure Premium: 1hr response time.',
            "Let's schedule deep-dive sessions with each vendor.",
          ][i],
          author: i % 2 === 0 ? 'user' : ('assistant' as const),
          timestamp: new Date('2025-03-07T11:45:00').toISOString(),
        })) as MessageDto[],
        messageCount: 11,
        createdAt: new Date('2025-03-07T11:45:00'),
        lastMessageAt: new Date('2025-03-07T11:45:00'),
      },
    ] as ThreadDto[];

    return threads;
  }
}
