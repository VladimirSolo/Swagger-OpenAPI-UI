'use client';

import { useTranslations } from 'next-intl';
import { Flex, Tag, Typography } from 'antd';
import { GithubOutlined } from '@ant-design/icons';

const TECHNOLOGIES = [
  'Next.js',
  'React',
  'TypeScript',
  'Firebase',
  'Monaco Editor',
  'swagger-ui-react',
  'antd',
  'Tailwind CSS',
  'next-intl',
];

const TEAM = [{ name: 'Vladimir Solodkov', github: 'https://github.com/VladimirSolo' }];

export default function AboutPage() {
  const t = useTranslations('About');

  return (
    <Flex vertical flex={1} gap={40} className="mx-auto! w-full max-w-3xl px-6 py-16">
      <Typography.Title level={1} className="text-2xl!">
        {t('title')}
      </Typography.Title>

      <Flex vertical gap={12}>
        <Typography.Title level={2} className="text-lg!">
          {t('courseHeading')}
        </Typography.Title>
        <Typography.Paragraph>{t('courseText')}</Typography.Paragraph>
        <Typography.Link href="https://rs.school/" target="_blank" rel="noopener noreferrer">
          rs.school
        </Typography.Link>
      </Flex>

      <Flex vertical gap={12}>
        <Typography.Title level={2} className="text-lg!">
          {t('projectHeading')}
        </Typography.Title>
        <Typography.Paragraph>{t('projectText')}</Typography.Paragraph>
      </Flex>

      <Flex vertical gap={12}>
        <Typography.Title level={2} className="text-lg!">
          {t('technologiesHeading')}
        </Typography.Title>
        <Flex wrap gap={8}>
          {TECHNOLOGIES.map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
        </Flex>
      </Flex>

      <Flex vertical gap={12}>
        <Typography.Title level={2} className="text-lg!">
          {t('teamHeading')}
        </Typography.Title>
        <Flex vertical gap={16}>
          {TEAM.map((member) => (
            <Flex
              key={member.name}
              vertical
              gap={4}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <Typography.Text strong>{member.name}</Typography.Text>
              <Typography.Text type="secondary" className="text-sm!">
                {t('memberRole')}
              </Typography.Text>
              <Typography.Link
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm!"
              >
                <GithubOutlined /> {member.github.replace('https://', '')}
              </Typography.Link>
            </Flex>
          ))}
        </Flex>
      </Flex>

      <Flex vertical gap={12}>
        <Typography.Title level={2} className="text-lg!">
          {t('resourcesHeading')}
        </Typography.Title>
        <Flex vertical gap={4}>
          <Typography.Link href="https://rs.school/" target="_blank" rel="noopener noreferrer">
            {t('resourceCourse')}
          </Typography.Link>
          <Typography.Link
            href="https://github.com/VladimirSolo/Swagger-OpenAPI-UI"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('resourceRepo')}
          </Typography.Link>
        </Flex>
      </Flex>
    </Flex>
  );
}
