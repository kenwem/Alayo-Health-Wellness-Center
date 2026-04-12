import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { siteId, isAdmin } from '../constants/siteConfig';
import { MessageSquare, Send, Trash2, LogIn, LogOut, User as UserIcon, CornerDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Comment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhoto: string;
  text: string;
  createdAt: any;
  status: 'pending' | 'approved';
  replies?: Reply[];
}

interface Reply {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhoto: string;
  text: string;
  createdAt: any;
  status: 'pending' | 'approved';
}

interface CommentSectionProps {
  collectionName: string;
  docId: string;
}

export default function CommentSection({ collectionName, docId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    const commentsRef = collection(db, 'sites', siteId, collectionName, docId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));

    const unsubscribeComments = onSnapshot(q, (snapshot) => {
      const commentsData: Comment[] = [];
      snapshot.docs.forEach((commentDoc) => {
        const data = commentDoc.data();
        // Show if approved OR if it's the current user's pending comment
        if (data.status === 'approved' || (auth.currentUser && data.userId === auth.currentUser.uid)) {
          const comment = { id: commentDoc.id, ...data } as Comment;
          
          // Fetch replies for each comment
          const repliesRef = collection(db, 'sites', siteId, collectionName, docId, 'comments', commentDoc.id, 'replies');
          const rq = query(repliesRef, orderBy('createdAt', 'asc'));
          
          onSnapshot(rq, (rSnapshot) => {
            const replies = rSnapshot.docs
              .map(rdoc => ({ id: rdoc.id, ...rdoc.data() }))
              .filter((r: any) => r.status === 'approved' || (auth.currentUser && r.userId === auth.currentUser.uid)) as Reply[];
            setComments(prev => prev.map(c => c.id === comment.id ? { ...c, replies } : c));
          }, (error) => {
            console.error('Error fetching replies:', error);
          });

          commentsData.push(comment);
        }
      });
      setComments(commentsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching comments:', error);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeComments();
    };
  }, [collectionName, docId]);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = () => signOut(auth);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    const status = isAdmin(user.email) ? 'approved' : 'pending';
    
    try {
      await addDoc(collection(db, 'sites', siteId, collectionName, docId, 'comments'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        text: newComment,
        createdAt: serverTimestamp(),
        status
      });
      setNewComment('');
      if (status === 'pending') {
        alert('Your comment is pending approval by the administrator.');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleSubmitReply = async (commentId: string) => {
    if (!user || !replyText.trim()) return;

    const status = isAdmin(user.email) ? 'approved' : 'pending';

    try {
      await addDoc(collection(db, 'sites', siteId, collectionName, docId, 'comments', commentId, 'replies'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        text: replyText,
        createdAt: serverTimestamp(),
        status
      });
      setReplyText('');
      setReplyingTo(null);
      if (status === 'pending') {
        alert('Your reply is pending approval by the administrator.');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleDelete = async (commentId: string, replyId?: string) => {
    if (!user) return;
    
    const path = replyId 
      ? doc(db, 'sites', siteId, collectionName, docId, 'comments', commentId, 'replies', replyId)
      : doc(db, 'sites', siteId, collectionName, docId, 'comments', commentId);

    try {
      await deleteDoc(path);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  return (
    <div className="mt-16 bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <MessageSquare className="text-lime-500" />
          Comments ({comments.length})
        </h3>
        {!user ? (
          <button 
            onClick={handleSignIn}
            className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-stone-800 transition-all"
          >
            <LogIn size={16} /> Sign in to comment
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                  <UserIcon size={16} className="text-stone-400" />
                </div>
              )}
              <span className="text-sm font-medium text-stone-600">{user.displayName}</span>
            </div>
            <button 
              onClick={handleSignOut}
              className="text-stone-400 hover:text-stone-600 transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>

      {user && (
        <form onSubmit={handleSubmitComment} className="mb-12">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all min-h-[120px] resize-none"
            />
            <button 
              type="submit"
              disabled={!newComment.trim()}
              className="absolute bottom-4 right-4 bg-lime-500 text-white p-3 rounded-xl hover:bg-lime-600 transition-all disabled:bg-stone-300 shadow-lg shadow-lime-500/20"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      )}

      <div className="space-y-8">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-stone-500 py-8">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              <div className="flex gap-4">
                <div className="shrink-0">
                  {comment.userPhoto ? (
                    <img src={comment.userPhoto} alt={comment.userName} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                      <UserIcon size={20} className="text-stone-400" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="bg-stone-50 rounded-2xl p-4 relative group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">{comment.userName}</span>
                        {isAdmin(comment.userEmail) && (
                          <span className="bg-lime-100 text-lime-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400">
                        {comment.createdAt?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-stone-700 text-sm leading-relaxed">{comment.text}</p>
                    
                    <div className="mt-3 flex items-center gap-4">
                      {user && (
                        <button 
                          onClick={() => setReplyingTo(comment.id)}
                          className="text-xs font-bold text-lime-600 hover:text-lime-700 transition-colors"
                        >
                          Reply
                        </button>
                      )}
                      {(user?.uid === comment.userId || isAdmin(user?.email)) && (
                        <button 
                          onClick={() => handleDelete(comment.id)}
                          className="text-stone-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 ml-8 space-y-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <div className="shrink-0">
                            <CornerDownRight size={16} className="text-stone-300 mt-2" />
                          </div>
                          <div className="shrink-0">
                            {reply.userPhoto ? (
                              <img src={reply.userPhoto} alt={reply.userName} className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                                <UserIcon size={14} className="text-stone-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow bg-stone-50/50 rounded-2xl p-3 relative group border border-stone-100">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-stone-900 text-xs">{reply.userName}</span>
                                {isAdmin(reply.userEmail) && (
                                  <span className="bg-lime-100 text-lime-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                    Admin
                                  </span>
                                )}
                                {reply.status === 'pending' && (
                                  <span className="bg-amber-100 text-amber-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                    Pending
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-stone-400">
                                {reply.createdAt?.toDate().toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-stone-700 text-xs leading-relaxed">{reply.text}</p>
                            {(user?.uid === reply.userId || isAdmin(user?.email)) && (
                              <button 
                                onClick={() => handleDelete(comment.id, reply.id)}
                                className="absolute top-3 right-3 text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  <AnimatePresence>
                    {replyingTo === comment.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 ml-8 overflow-hidden"
                      >
                        <div className="relative">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all text-sm min-h-[80px] resize-none"
                          />
                          <div className="absolute bottom-3 right-3 flex gap-2">
                            <button 
                              onClick={() => setReplyingTo(null)}
                              className="text-xs font-bold text-stone-400 hover:text-stone-600 px-3 py-1"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleSubmitReply(comment.id)}
                              disabled={!replyText.trim()}
                              className="bg-lime-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-lime-600 transition-all disabled:bg-stone-200"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
