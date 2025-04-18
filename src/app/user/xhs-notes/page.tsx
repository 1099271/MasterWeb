'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/user/UserLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { getXhsNotesList, XhsNoteListItem, PaginatedXhsNotesResponse } from '@/lib/auth';
import Link from 'next/link';

// 定义排序字段常量
const SORT_FIELDS = {
  LIKES: 'note_liked_count',
  COMMENTS: 'comment_count',
  SHARES: 'share_count',
  COLLECTED: 'collected_count',
  CREATE_TIME: 'note_create_time',
  UPDATE_TIME: 'note_last_update_time'
};

export default function XhsNotesPage() {
  // 状态定义
  const [isLoading, setIsLoading] = useState(false);
  const [notesData, setNotesData] = useState<PaginatedXhsNotesResponse>({
    items: [],
    total: 0,
    page: 1,
    page_size: 20
  });
  
  // 搜索条件状态
  const [filters, setFilters] = useState({
    note_id: '',
    title: '',
    content: '',
    min_likes: '',
    max_likes: '',
    min_comments: '',
    max_comments: '',
    min_shares: '',
    max_shares: '',
    author_id: '',
    author_name: '',
    start_create_time: '',
    end_create_time: '',
    start_update_time: '',
    end_update_time: ''
  });
  
  // 分页状态
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 排序状态
  const [sortBy, setSortBy] = useState<string>(SORT_FIELDS.CREATE_TIME); // 默认按创建时间排序
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // 默认降序
  
  // 高级筛选折叠状态
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // 获取小红书笔记列表数据
  const fetchNotes = async (pageNum = page) => {
    setIsLoading(true);
    
    try {
      // 转换数字类型的字段，去除空字符串
      const apiParams: any = {
        page: pageNum,
        page_size: pageSize,
        note_id: filters.note_id || undefined,
        title: filters.title || undefined,
        content: filters.content || undefined,
        author_id: filters.author_id || undefined,
        author_name: filters.author_name || undefined,
        start_create_time: filters.start_create_time || undefined,
        end_create_time: filters.end_create_time || undefined,
        start_update_time: filters.start_update_time || undefined,
        end_update_time: filters.end_update_time || undefined,
        sort_by: sortBy, // 添加排序字段
        sort_order: sortOrder, // 添加排序顺序
      };
      
      // 将字符串类型的数值转换为数字
      if (filters.min_likes) apiParams.min_likes = Number(filters.min_likes);
      if (filters.max_likes) apiParams.max_likes = Number(filters.max_likes);
      if (filters.min_comments) apiParams.min_comments = Number(filters.min_comments);
      if (filters.max_comments) apiParams.max_comments = Number(filters.max_comments);
      if (filters.min_shares) apiParams.min_shares = Number(filters.min_shares);
      if (filters.max_shares) apiParams.max_shares = Number(filters.max_shares);
      
      // 使用封装好的API函数获取数据
      const data = await getXhsNotesList(apiParams);
      
      setNotesData(data);
      setPage(pageNum);
    } catch (error) {
      console.error('获取小红书笔记失败:', error);
      // 添加用户友好的错误提示，例如使用 Toast
    } finally {
      setIsLoading(false);
    }
  };
  
  // 初始加载及排序/分页变化时重新加载
  useEffect(() => {
    fetchNotes();
  }, [sortBy, sortOrder, pageSize]); // 依赖项包含排序和分页大小
  
  // 处理搜索提交
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNotes(1); // 搜索时重置到第一页
  };

  // 处理排序变化
  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      // 如果点击的是当前排序字段，则切换排序顺序
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // 如果点击的是新的排序字段，则设置新字段并默认为降序
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    // 排序变化时，我们通常也希望回到第一页
    if (page !== 1) {
        setPage(1); // 触发 useEffect 重新获取数据
    } else {
        fetchNotes(1); // 如果已经是第一页，手动触发获取
    }
  };
  
  // 处理重置筛选条件
  const handleResetFilters = () => {
    setFilters({
      note_id: '',
      title: '',
      content: '',
      min_likes: '',
      max_likes: '',
      min_comments: '',
      max_comments: '',
      min_shares: '',
      max_shares: '',
      author_id: '',
      author_name: '',
      start_create_time: '',
      end_create_time: '',
      start_update_time: '',
      end_update_time: ''
    });
    // 重置筛选时，也可能需要重置排序到默认值（如果需要的话）
    // setSortBy(SORT_FIELDS.CREATE_TIME);
    // setSortOrder('desc');
    // fetchNotes(1); // 重置后重新获取第一页数据
  };
  
  // 处理翻页
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= Math.ceil(notesData.total / pageSize)) {
      fetchNotes(newPage);
    }
  };

  // 获取排序按钮的样式
  const getSortButtonStyle = (field: string) => {
    return sortBy === field
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600';
  };

  // 获取排序图标
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };
  
  return (
    <ProtectedRoute>
      <UserLayout>
        <div className="text-gray-900 dark:text-gray-100">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">小红书笔记列表</h1>
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 text-sm font-medium md:space-x-2">
                <li className="inline-flex items-center">
                  <Link href="/user/dashboard" className="inline-flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">
                    仪表盘
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="mx-1 text-gray-400 dark:text-gray-500">/</span>
                    <span className="text-blue-600 dark:text-blue-500">小红书笔记</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
          
          {/* 搜索表单 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <Input
                  label="笔记ID"
                  name="note_id"
                  value={filters.note_id}
                  onChange={handleInputChange}
                  placeholder="输入精确笔记ID"
                />
                
                <Input
                  label="标题搜索"
                  name="title"
                  value={filters.title}
                  onChange={handleInputChange}
                  placeholder="输入笔记标题关键词"
                />
                
                <Input
                  label="内容搜索"
                  name="content"
                  value={filters.content}
                  onChange={handleInputChange}
                  placeholder="输入笔记内容关键词"
                />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                >
                  {showAdvancedFilters ? '收起' : '展开'}高级筛选
                  <svg 
                    className={`ml-1 h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleResetFilters}
                  >
                    重置
                  </Button>
                  <Button 
                    type="submit" 
                    isLoading={isLoading}
                  >
                    搜索
                  </Button>
                </div>
              </div>
              
              {/* 高级筛选选项 */}
              {showAdvancedFilters && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">高级筛选</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="最小点赞数"
                        name="min_likes"
                        type="number"
                        min="0"
                        value={filters.min_likes}
                        onChange={handleInputChange}
                        placeholder="最小值"
                      />
                      <Input
                        label="最大点赞数"
                        name="max_likes"
                        type="number"
                        min="0"
                        value={filters.max_likes}
                        onChange={handleInputChange}
                        placeholder="最大值"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="最小评论数"
                        name="min_comments"
                        type="number"
                        min="0"
                        value={filters.min_comments}
                        onChange={handleInputChange}
                        placeholder="最小值"
                      />
                      <Input
                        label="最大评论数"
                        name="max_comments"
                        type="number"
                        min="0"
                        value={filters.max_comments}
                        onChange={handleInputChange}
                        placeholder="最大值"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="最小分享数"
                        name="min_shares"
                        type="number"
                        min="0"
                        value={filters.min_shares}
                        onChange={handleInputChange}
                        placeholder="最小值"
                      />
                      <Input
                        label="最大分享数"
                        name="max_shares"
                        type="number"
                        min="0"
                        value={filters.max_shares}
                        onChange={handleInputChange}
                        placeholder="最大值"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <Input
                      label="作者ID"
                      name="author_id"
                      value={filters.author_id}
                      onChange={handleInputChange}
                      placeholder="输入精确作者ID"
                    />
                    
                    <Input
                      label="作者昵称"
                      name="author_name"
                      value={filters.author_name}
                      onChange={handleInputChange}
                      placeholder="输入作者昵称关键词"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">笔记创建时间范围</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="开始时间"
                          name="start_create_time"
                          type="datetime-local"
                          value={filters.start_create_time}
                          onChange={handleInputChange}
                        />
                        <Input
                          label="结束时间"
                          name="end_create_time"
                          type="datetime-local"
                          value={filters.end_create_time}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">笔记更新时间范围</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="开始时间"
                          name="start_update_time"
                          type="datetime-local"
                          value={filters.start_update_time}
                          onChange={handleInputChange}
                        />
                        <Input
                          label="结束时间"
                          name="end_update_time"
                          type="datetime-local"
                          value={filters.end_update_time}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
          
          {/* 笔记列表展示 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-lg font-semibold whitespace-nowrap text-gray-900 dark:text-white">笔记列表</h2>
              
              <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                共 <span className="font-medium text-gray-700 dark:text-gray-300">{notesData.total}</span> 条记录
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                 加载中...
              </div>
            ) : notesData.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[100px]">
                        封面
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[150px]">
                        标题/ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">
                        作者
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 min-w-[90px] transition-colors duration-200"
                        onClick={() => handleSortChange(SORT_FIELDS.LIKES)}
                      >
                        <div className="flex items-center">
                          点赞
                          {sortBy === SORT_FIELDS.LIKES && (
                            <span className="ml-1 text-blue-600 dark:text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 min-w-[90px] transition-colors duration-200"
                        onClick={() => handleSortChange(SORT_FIELDS.COMMENTS)}
                      >
                        <div className="flex items-center">
                          评论
                          {sortBy === SORT_FIELDS.COMMENTS && (
                            <span className="ml-1 text-blue-600 dark:text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 min-w-[90px] transition-colors duration-200"
                        onClick={() => handleSortChange(SORT_FIELDS.SHARES)}
                      >
                        <div className="flex items-center">
                          分享
                          {sortBy === SORT_FIELDS.SHARES && (
                            <span className="ml-1 text-blue-600 dark:text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 min-w-[90px] transition-colors duration-200"
                        onClick={() => handleSortChange(SORT_FIELDS.COLLECTED)}
                      >
                        <div className="flex items-center">
                          收藏
                          {sortBy === SORT_FIELDS.COLLECTED && (
                            <span className="ml-1 text-blue-600 dark:text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 min-w-[140px] transition-colors duration-200"
                        onClick={() => handleSortChange(SORT_FIELDS.CREATE_TIME)}
                      >
                        <div className="flex items-center">
                          创建时间
                          {sortBy === SORT_FIELDS.CREATE_TIME && (
                            <span className="ml-1 text-blue-600 dark:text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 min-w-[140px] transition-colors duration-200"
                        onClick={() => handleSortChange(SORT_FIELDS.UPDATE_TIME)}
                      >
                        <div className="flex items-center">
                          更新时间
                          {sortBy === SORT_FIELDS.UPDATE_TIME && (
                            <span className="ml-1 text-blue-600 dark:text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[80px] sticky right-0 bg-gray-50 dark:bg-gray-700 shadow-sm z-10">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {notesData.items.map((note) => (
                      <tr key={note.note_id} className="group hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {note.note_cover_url_default ? (
                            <img 
                              src={note.note_cover_url_default} 
                              alt="笔记封面"
                              className="h-16 w-16 object-cover rounded-md"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                              <span className="text-xs text-gray-500 dark:text-gray-400">无封面</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                            {note.note_display_title || '无标题'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ID: {note.note_id}
                          </div>
                          <a 
                            href={note.note_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1 inline-block"
                          >
                            查看原文
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {note.author_avatar ? (
                              <img 
                                src={note.author_avatar} 
                                alt="作者头像"
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400">无</span>
                              </div>
                            )}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {note.author_nick_name || '未知用户'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {note.author_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {note.note_liked_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {note.comment_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {note.share_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {note.collected_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {note.note_create_time 
                            ? new Date(note.note_create_time).toLocaleString('zh-CN', { 
                                year: 'numeric', 
                                month: '2-digit', 
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) 
                            : '未知'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {note.note_last_update_time 
                            ? new Date(note.note_last_update_time).toLocaleString('zh-CN', { 
                                year: 'numeric', 
                                month: '2-digit', 
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) 
                            : '未知'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700 shadow-sm">
                          <a 
                            href={`/user/xhs-notes/${note.note_id}`} 
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            详情
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                暂无数据
              </div>
            )}
            
            {/* 分页控件 */}
            {notesData.total > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center">
                  <label className="text-sm text-gray-700 dark:text-gray-300 mr-2">每页显示：</label>
                  <select
                    className="text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={pageSize}
                    onChange={(e) => {
                      const newSize = parseInt(e.target.value);
                      setPageSize(newSize);
                      fetchNotes(1);
                    }}
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
                
                <div className="flex justify-center">
                  <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      <span className="sr-only">上一页</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                      {page} / {Math.ceil(notesData.total / pageSize)}
                    </div>
                    <button
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= Math.ceil(notesData.total / pageSize)}
                    >
                      <span className="sr-only">下一页</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    显示 {(page - 1) * pageSize + 1} 至 {Math.min(page * pageSize, notesData.total)} 条，共 <span className="font-medium text-gray-900 dark:text-white">{notesData.total}</span> 条
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </UserLayout>
    </ProtectedRoute>
  );
} 