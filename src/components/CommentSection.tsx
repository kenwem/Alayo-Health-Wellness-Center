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
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { siteId, isAdmin } from '../constants/siteConfig';
import { MessageSquare, Send, Trash2, LogIn, LogOut, User as UserIcon, CornerDownRight, X, Mail, Lock, UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      setAuthLoading(true);
      await signInWithPopup(auth, provider);
      setShowAuthModal(false);
    } catch (error: any) {
      console.error('Error signing in:', error);
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (error: any) {
      console.error('Auth error:', error);
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
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
            onClick={() => setShowAuthModal(true)}
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
                        {comment.status === 'pending' && (
                          <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Pending Approval
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

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-stone-900 p-6 text-center relative">
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
                <h4 className="text-xl font-bold text-white mb-1">
                  {authMode === 'login' ? 'Welcome Back' : 'Join the Community'}
                </h4>
                <p className="text-lime-500 text-xs font-medium uppercase tracking-wider">
                  {authMode === 'login' ? 'Sign in to share your thoughts' : 'Create an account to comment'}
                </p>
              </div>

              <div className="p-8">
                {authError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-xs border border-red-100">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-lime-500 outline-none transition-all text-sm"
                        placeholder="Your Name"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-lime-500 outline-none transition-all text-sm"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-lime-500 outline-none transition-all text-sm"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-lime-500 hover:bg-lime-600 disabled:bg-stone-300 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2"
                  >
                    {authLoading ? <Loader2 className="animate-spin" size={18} /> : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
                  </button>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-100"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-stone-400 font-medium">Or continue with</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                  Sign in with Google
                </button>

                <p className="text-center mt-8 text-sm text-stone-500">
                  {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="text-lime-600 font-bold hover:underline"
                  >
                    {authMode === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
