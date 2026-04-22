import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../../firebase';
import { siteId } from '../../constants/siteConfig';
import { Check, X, Trash2, MessageSquare, User, Calendar, ExternalLink } from 'lucide-react';

interface ModerationItem {
  id: string;
  commentId: string;
  replyId?: string;
  collectionName: string;
  docId: string;
  docTitle?: string;
  userId: string;
  userEmail: string;
  userName: string;
  text: string;
  createdAt: any;
  status: 'pending' | 'approved';
  type: 'comment' | 'reply';
}

export default function CommentModeration() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const collectionsToCheck = ['editorial', 'products', 'services'];

  const fetchAllComments = async () => {
    setLoading(true);
    const allItems: ModerationItem[] = [];

    try {
      for (const colName of collectionsToCheck) {
        const colRef = collection(db, 'sites', siteId, colName);
        const colSnap = await getDocs(colRef);

        for (const docItem of colSnap.docs) {
          const docData = docItem.data();
          const docTitle = docData.title || docData.name || docItem.id;

          // Fetch comments
          const commentsRef = collection(db, 'sites', siteId, colName, docItem.id, 'comments');
          const commentsSnap = await getDocs(query(commentsRef, orderBy('createdAt', 'desc')));

          for (const commentDoc of commentsSnap.docs) {
            const commentData = commentDoc.data();
            allItems.push({
              id: commentDoc.id,
              commentId: commentDoc.id,
              collectionName: colName,
              docId: docItem.id,
              docTitle,
              userId: commentData.userId,
              userEmail: commentData.userEmail,
              userName: commentData.userName,
              text: commentData.text,
              createdAt: commentData.createdAt,
              status: commentData.status,
              type: 'comment'
            });

            // Fetch replies
            const repliesRef = collection(db, 'sites', siteId, colName, docItem.id, 'comments', commentDoc.id, 'replies');
            const repliesSnap = await getDocs(query(repliesRef, orderBy('createdAt', 'asc')));

            for (const replyDoc of repliesSnap.docs) {
              const replyData = replyDoc.data();
              allItems.push({
                id: replyDoc.id,
                commentId: commentDoc.id,
                replyId: replyDoc.id,
                collectionName: colName,
                docId: docItem.id,
                docTitle,
                userId: replyData.userId,
                userEmail: replyData.userEmail,
                userName: replyData.userName,
                text: replyData.text,
                createdAt: replyData.createdAt,
                status: replyData.status,
                type: 'reply'
              });
            }
          }
        }
      }

      // Sort by date descending
      allItems.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setItems(allItems);
    } catch (error) {
      console.error('Error fetching comments for moderation:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllComments();
  }, []);

  const handleApprove = async (item: ModerationItem) => {
    const path = item.replyId 
      ? doc(db, 'sites', siteId, item.collectionName, item.docId, 'comments', item.commentId, 'replies', item.replyId)
      : doc(db, 'sites', siteId, item.collectionName, item.docId, 'comments', item.commentId);

    try {
      await updateDoc(path, { status: 'approved' });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'approved' } : i));
    } catch (error) {
      console.error('Error approving:', error);
    }
  };

  const handleDelete = async (item: ModerationItem) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    const path = item.replyId 
      ? doc(db, 'sites', siteId, item.collectionName, item.docId, 'comments', item.commentId, 'replies', item.replyId)
      : doc(db, 'sites', siteId, item.collectionName, item.docId, 'comments', item.commentId);

    try {
      await deleteDoc(path);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Comment Moderation</h2>
          <p className="text-sm text-stone-500">Manage user comments across all sections of the site.</p>
        </div>
        <div className="flex bg-stone-100 p-1 rounded-xl">
          {(['pending', 'approved', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === f ? 'bg-white text-lime-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
          <MessageSquare size={48} className="mx-auto text-stone-200 mb-4" />
          <p className="text-stone-500">No {filter !== 'all' ? filter : ''} comments found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {paginatedItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 hover:border-lime-200 transition-all">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-grow space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.type === 'comment' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                        {item.type}
                      </span>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.status === 'approved' ? 'bg-lime-100 text-lime-600' : 'bg-amber-100 text-amber-600'}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                      <Calendar size={14} />
                      {item.createdAt?.toDate() ? 
                        `${item.createdAt.toDate().getDate().toString().padStart(2, '0')}/${(item.createdAt.toDate().getMonth() + 1).toString().padStart(2, '0')}/${item.createdAt.toDate().getFullYear()} ${item.createdAt.toDate().getHours().toString().padStart(2, '0')}:${item.createdAt.toDate().getMinutes().toString().padStart(2, '0')}` 
                        : ''}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center shrink-0">
                      <User size={20} className="text-stone-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900">{item.userName}</h4>
                      <p className="text-xs text-stone-500">{item.userEmail}</p>
                    </div>
                  </div>

                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <p className="text-stone-700 leading-relaxed">{item.text}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="font-bold text-stone-400">On:</span>
                    <span className="capitalize">{item.collectionName}</span>
                    <span className="text-stone-300">/</span>
                    <span className="font-medium text-stone-700">{item.docTitle}</span>
                    <a 
                      href={`/${item.collectionName === 'editorial' ? 'blog' : item.collectionName}/${item.docId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-lime-600 hover:underline flex items-center gap-1 ml-2"
                    >
                      View Page <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 shrink-0 justify-end md:justify-start">
                  {item.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(item)}
                      className="flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                      <Check size={18} /> Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item)}
                    className="flex items-center justify-center gap-2 bg-white border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-200 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 flex justify-center items-center gap-4">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1 bg-white border border-stone-200 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-stone-600 font-medium">Page {currentPage} of {totalPages}</span>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1 bg-white border border-stone-200 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
