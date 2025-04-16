'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Heart, MessageSquare, Share2, Bookmark } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import {
  getNoteBasicDetails,
  getNoteAuthorDetails,
  getNoteKeywordGroups,
  getNoteComments,
  getNoteLlmDiagnoses,
  getNoteTagComparisons,
  getNoteCommentAnalyses,
  NoteBasicDetails,
  AuthorDetails,
  KeywordGroupItem
} from '@/lib/auth';

// 定义其他接口组件需要的类型
interface CommentItem {
  id: string;
  content: string;
  user_id: string;
  user_name: string;
  created_at: string;
  [key: string]: any; // 允许其他属性
  
  // 评论特定字段
  comment_id: string;
  note_id: string;
  comment_user_id: string;
  parent_comment_id: string | null;
  comment_user_nickname: string;
  comment_user_image: string;
  comment_user_home_page_url: string | null;
  comment_content: string;
  comment_like_count: number;
  comment_sub_comment_count: number;
  comment_create_time: string;
  comment_liked: boolean;
  comment_show_tags: string[];
  comment_sub_comment_cursor: string | null;
  comment_sub_comment_has_more: boolean;
  comment_at_users: any[];
  comment_sub: any[];
  replies: CommentItem[];
}

interface LlmDiagnosisItem {
  id: string;
  diagnosis_type: string;
  content: string;
  created_at: string;
  [key: string]: any; // 允许其他属性
}

interface TagComparisonItem {
  id: string;
  comparison_type: string;
  tags: string[];
  created_at: string;
  [key: string]: any; // 允许其他属性
}

interface CommentAnalysisItem {
  id: string;
  analysis_type: string;
  content: string;
  created_at: string;
  [key: string]: any; // 允许其他属性
}

const XhsNoteDetail = () => {
  const { note_id } = useParams();
  const [basicInfo, setBasicInfo] = useState<NoteBasicDetails | null>(null);
  const [authorDetails, setAuthorDetails] = useState<AuthorDetails | null>(null);
  const [keywordGroups, setKeywordGroups] = useState<KeywordGroupItem[]>([]);
  const [isLoadingBasic, setIsLoadingBasic] = useState(true);
  const [isLoadingAuthor, setIsLoadingAuthor] = useState(false);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);

  // 获取笔记基础信息
  useEffect(() => {
    const fetchBasicInfo = async () => {
      setIsLoadingBasic(true);
      try {
        const data = await getNoteBasicDetails(note_id as string);
        setBasicInfo(data);
      } catch (error) {
        console.error('Error fetching note details:', error);
      } finally {
        setIsLoadingBasic(false);
      }
    };

    if (note_id) {
      fetchBasicInfo();
    }
  }, [note_id]);

  // 获取作者详细信息
  const fetchAuthorDetails = async () => {
    if (isLoadingAuthor || authorDetails) return;
    
    setIsLoadingAuthor(true);
    try {
      const data = await getNoteAuthorDetails(note_id as string);
      setAuthorDetails(data);
    } catch (error) {
      console.error('Error fetching author details:', error);
    } finally {
      setIsLoadingAuthor(false);
    }
  };

  // 获取关键词组
  const fetchKeywordGroups = async () => {
    if (isLoadingKeywords || keywordGroups.length > 0) return;
    
    setIsLoadingKeywords(true);
    try {
      const data = await getNoteKeywordGroups(note_id as string);
      setKeywordGroups(data);
    } catch (error) {
      console.error('Error fetching keyword groups:', error);
    } finally {
      setIsLoadingKeywords(false);
    }
  };

  if (isLoadingBasic) {
    return <NoteDetailSkeleton />;
  }

  if (!basicInfo) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">笔记不存在</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">无法找到ID为 {note_id} 的笔记信息</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* 左侧主内容区域 */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={basicInfo.auther_avatar || ''} alt={basicInfo.auther_nick_name || '作者'} />
                  <AvatarFallback>{basicInfo.auther_nick_name?.slice(0, 2) || 'XH'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{basicInfo.auther_nick_name || '未知作者'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {basicInfo.note_create_time ? formatDate(new Date(basicInfo.note_create_time)) : '未知时间'}
                  </p>
                </div>
              </div>
              <CardTitle className="text-2xl">{basicInfo.note_display_title || '无标题'}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 笔记内容区域 */}
              <div className="space-y-6">
                {/* 笔记媒体内容：图片或视频 */}
                <div className="overflow-hidden rounded-lg">
                  {basicInfo.video_h264_url ? (
                    <video 
                      className="w-full rounded-lg" 
                      controls
                      poster={basicInfo.note_cover_url_default || undefined}
                    >
                      <source src={basicInfo.video_h264_url} type="video/mp4" />
                      您的浏览器不支持视频播放
                    </video>
                  ) : basicInfo.note_image_list && basicInfo.note_image_list.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {basicInfo.note_image_list.map((image, index) => (
                        <div key={index} className="relative rounded-lg overflow-hidden">
                          <img
                            src={image.url}
                            alt={`笔记图片 ${index + 1}`}
                            className="w-full h-auto"
                          />
                        </div>
                      ))}
                    </div>
                  ) : basicInfo.note_cover_url_default ? (
                    <div className="relative rounded-lg overflow-hidden">
                      <img
                        src={basicInfo.note_cover_url_default}
                        alt="笔记封面图"
                        className="w-full h-auto"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg py-12 flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">无图片或视频</p>
                    </div>
                  )}
                </div>

                {/* 笔记描述 */}
                <div className="prose dark:prose-invert max-w-none">
                  <p>{basicInfo.note_desc || '无描述'}</p>
                </div>

                {/* 笔记标签 */}
                {basicInfo.note_tags && basicInfo.note_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {basicInfo.note_tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* 互动数据 */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{basicInfo.note_liked_count || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{basicInfo.comment_count || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{basicInfo.share_count || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Bookmark className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{basicInfo.collected_count || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      更新于: {basicInfo.note_last_update_time ? formatDate(new Date(basicInfo.note_last_update_time)) : '未知'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab区域：评论、诊断等内容 */}
              <Tabs defaultValue="comments" className="mt-8">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="comments">评论</TabsTrigger>
                  <TabsTrigger value="llm-diagnoses">LLM诊断</TabsTrigger>
                  <TabsTrigger value="tag-comparisons">标签比较</TabsTrigger>
                  <TabsTrigger value="comment-analyses">评论分析</TabsTrigger>
                </TabsList>
                
                <TabsContent value="comments">
                  <CommentsSection noteId={note_id as string} />
                </TabsContent>
                
                <TabsContent value="llm-diagnoses">
                  <LlmDiagnosesSection noteId={note_id as string} />
                </TabsContent>
                
                <TabsContent value="tag-comparisons">
                  <TagComparisonsSection noteId={note_id as string} />
                </TabsContent>
                
                <TabsContent value="comment-analyses">
                  <CommentAnalysesSection noteId={note_id as string} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* 右侧侧边栏：作者信息和关键词组 */}
        <div className="space-y-6">
          {/* 作者信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>作者信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={basicInfo.auther_avatar || ''} alt={basicInfo.auther_nick_name || '作者'} />
                    <AvatarFallback>{basicInfo.auther_nick_name?.slice(0, 2) || 'XH'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{basicInfo.auther_nick_name || '未知作者'}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {basicInfo.auther_user_id || '未知'}</p>
                  </div>
                </div>

                {!authorDetails && (
                  <button 
                    className="w-full px-4 py-2 text-sm font-medium text-center text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                    onClick={fetchAuthorDetails}
                    disabled={isLoadingAuthor}
                  >
                    {isLoadingAuthor ? '加载中...' : '查看详细信息'}
                  </button>
                )}

                {authorDetails && (
                  <div className="space-y-3 pt-2">
                    <Separator />
                    
                    {authorDetails.desc && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">简介</h4>
                        <p className="mt-1 text-sm">{authorDetails.desc}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">粉丝</h4>
                        <p className="mt-1 text-sm">{authorDetails.fans}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">关注</h4>
                        <p className="mt-1 text-sm">{authorDetails.follows}</p>
                      </div>
                    </div>
                    
                    {authorDetails.ip_location && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">IP属地</h4>
                        <p className="mt-1 text-sm">{authorDetails.ip_location}</p>
                      </div>
                    )}
                    
                    {authorDetails.gender && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">性别</h4>
                        <p className="mt-1 text-sm">{
                          authorDetails.gender === 'male' ? '男' : 
                          authorDetails.gender === 'female' ? '女' : 
                          authorDetails.gender
                        }</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 关键词群组卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>关键词群组</CardTitle>
            </CardHeader>
            <CardContent>
              {!keywordGroups.length && !isLoadingKeywords && (
                <button 
                  className="w-full px-4 py-2 text-sm font-medium text-center text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                  onClick={fetchKeywordGroups}
                  disabled={isLoadingKeywords}
                >
                  {isLoadingKeywords ? '加载中...' : '加载关键词群组'}
                </button>
              )}

              {isLoadingKeywords && (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-5/6" />
                </div>
              )}

              {keywordGroups.length > 0 && (
                <div className="space-y-4">
                  {keywordGroups.map((group, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="text-sm font-medium">{group.keyword_group.group_name}</h4>
                      {group.keyword_group.keywords && group.keyword_group.keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {group.keyword_group.keywords.map((keyword, kidx) => (
                            <Badge key={kidx} variant="secondary">{keyword}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">无关键词</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// 评论区组件
const CommentsSection = ({ noteId }: { noteId: string }) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMoreReplies, setLoadingMoreReplies] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const data = await getNoteComments(noteId);
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [noteId]);

  // 加载更多回复
  const handleLoadMoreReplies = async (commentId: string, cursor: string) => {
    setLoadingMoreReplies(prev => ({ ...prev, [commentId]: true }));
    try {
      // 这里应该有一个加载更多回复的API，暂时模拟
      console.log(`Loading more replies for comment ${commentId} from cursor ${cursor}`);
      // 实际实现中应该调用API获取更多回复
      // const moreReplies = await getMoreReplies(commentId, cursor);
      // 更新评论列表中的回复
      setTimeout(() => {
        setLoadingMoreReplies(prev => ({ ...prev, [commentId]: false }));
      }, 1000);
    } catch (error) {
      console.error('Error loading more replies:', error);
      setLoadingMoreReplies(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // 格式化评论时间
  const formatCommentTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return '刚刚';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}分钟前`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}小时前`;
    } else if (diffInSeconds < 2592000) {
      return `${Math.floor(diffInSeconds / 86400)}天前`;
    } else {
      return formatDate(date);
    }
  };

  // 单个评论组件
  const CommentItem = ({ comment, isReply = false, level = 0 }: { comment: CommentItem, isReply?: boolean, level?: number }) => {
    const isAuthor = comment.comment_show_tags.includes('is_author');
    const hasContent = comment.comment_content.trim().length > 0;

    return (
      <div className={`${isReply ? 'ml-12 mt-3' : 'mt-4'} ${level >= 2 ? 'ml-4' : ''}`}>
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.comment_user_image} alt={comment.comment_user_nickname} />
              <AvatarFallback>{comment.comment_user_nickname.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-grow">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-sm">
                {comment.comment_user_nickname}
              </span>
              {isAuthor && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-0.5">
                  作者
                </Badge>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatCommentTime(comment.comment_create_time)}
              </span>
            </div>
            
            <div className="mt-1 text-sm">
              {hasContent ? (
                <p className="text-gray-800 dark:text-gray-200">{comment.comment_content}</p>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic">[表情或图片]</p>
              )}
            </div>
            
            <div className="mt-2 flex items-center gap-4">
              <button className="flex items-center text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">
                <Heart className="h-3.5 w-3.5 mr-1" />
                {comment.comment_like_count > 0 ? comment.comment_like_count : '点赞'}
              </button>
              <button className="text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">
                回复
              </button>
            </div>
          </div>
        </div>

        {/* 嵌套回复 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.comment_id} comment={reply} isReply={true} level={level + 1} />
            ))}
          </div>
        )}

        {/* 查看更多回复 */}
        {comment.comment_sub_comment_has_more && comment.comment_sub_comment_cursor && (
          <div className="ml-12 mt-3">
            <button 
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
              onClick={() => handleLoadMoreReplies(comment.comment_id, comment.comment_sub_comment_cursor as string)}
              disabled={loadingMoreReplies[comment.comment_id]}
            >
              {loadingMoreReplies[comment.comment_id] ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  加载中...
                </span>
              ) : (
                <>查看更多回复 ({comment.comment_sub_comment_count - comment.replies.length})</>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">暂无评论</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">评论 ({comments.length})</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          按时间排序
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {comments.map((comment) => (
          <CommentItem key={comment.comment_id} comment={comment} />
        ))}
      </div>
      
      {comments.length > 10 && (
        <div className="pt-4 text-center">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700">
            查看更多评论
          </button>
        </div>
      )}
    </div>
  );
};

// LLM诊断区组件
const LlmDiagnosesSection = ({ noteId }: { noteId: string }) => {
  const [diagnoses, setDiagnoses] = useState<LlmDiagnosisItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDiagnoses = async () => {
      setIsLoading(true);
      try {
        const data = await getNoteLlmDiagnoses(noteId);
        setDiagnoses(data);
      } catch (error) {
        console.error('Error fetching LLM diagnoses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagnoses();
  }, [noteId]);

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!diagnoses.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">暂无LLM诊断结果</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <p className="text-gray-500 dark:text-gray-400">暂未实现LLM诊断显示</p>
      {/* LLM诊断内容将在此处实现 */}
    </div>
  );
};

// 标签比较区组件
const TagComparisonsSection = ({ noteId }: { noteId: string }) => {
  const [comparisons, setComparisons] = useState<TagComparisonItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComparisons = async () => {
      setIsLoading(true);
      try {
        const data = await getNoteTagComparisons(noteId);
        setComparisons(data);
      } catch (error) {
        console.error('Error fetching tag comparisons:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComparisons();
  }, [noteId]);

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!comparisons.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">暂无标签比较数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <p className="text-gray-500 dark:text-gray-400">暂未实现标签比较显示</p>
      {/* 标签比较内容将在此处实现 */}
    </div>
  );
};

// 评论分析区组件
const CommentAnalysesSection = ({ noteId }: { noteId: string }) => {
  const [analyses, setAnalyses] = useState<CommentAnalysisItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyses = async () => {
      setIsLoading(true);
      try {
        const data = await getNoteCommentAnalyses(noteId);
        setAnalyses(data);
      } catch (error) {
        console.error('Error fetching comment analyses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyses();
  }, [noteId]);

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!analyses.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">暂无评论分析数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <p className="text-gray-500 dark:text-gray-400">暂未实现评论分析显示</p>
      {/* 评论分析内容将在此处实现 */}
    </div>
  );
};

// 加载骨架屏
const NoteDetailSkeleton = () => {
  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* 左侧主内容区域骨架屏 */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Skeleton className="h-72 w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧侧边栏骨架屏 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-5/6" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default XhsNoteDetail; 