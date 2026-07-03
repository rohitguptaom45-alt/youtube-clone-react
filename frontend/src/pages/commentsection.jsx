import React, { useState, useEffect } from 'react';
import API from '../api';
import { Auth } from '../auth';
import '../styles/CommentSection.css';

// Backend comment shape (expected): { _id, content, owner: {_id, username, fullName, avatar}, createdAt, commentLike/likesCount, isLiked }
// Normalized here so rendering doesn't care whether fields are populated/nested or flat.
function normalizeComment(c) {
  return {
    id: c._id || c.id,
    userId: c.owner?._id || c.owner?.id || c.userId,
    username: c.owner?.username || c.username || 'user',
    fullName: c.owner?.fullName || c.fullName || 'User',
    avatar: c.owner?.avatar || c.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
    content: c.content,
    likeCount: c.commentLike ?? c.likesCount ?? c.likeCount ?? 0,
    isLiked: c.isLiked ?? false,
    createdAt: c.createdAt
  };
}

function getTimeAgo(dateStr) {
  const now = new Date();
  const diff = now - new Date(dateStr);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `just now`;
}

function CommentSection({ videoId }) {
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 10;

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const userData = Auth.getUser();
    if (userData) setUser(userData);
  }, []);

  useEffect(() => {
    if (videoId) {
      setPage(1);
      fetchComments(1, false);
    }
  }, [videoId]);

  const fetchComments = async (pageNum, append) => {
    try {
      setLoading(!append);
      const response = await API.getVideoComments(videoId, pageNum, limit);
      if (response?.success && response?.data) {
        const rawList = Array.isArray(response.data) ? response.data : (response.data.comments || response.data.docs || []);
        const normalized = rawList.map(normalizeComment);
        setComments(prev => append ? [...prev, ...normalized] : normalized);
        setHasMore(normalized.length === limit);
      } else {
        if (!append) setComments([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Fetch comments error:', error);
      if (!append) setComments([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, true);
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      setPosting(true);
      const response = await API.addComment(videoId, newComment.trim());
      if (response?.success) {
        setNewComment('');
        setPage(1);
        await fetchComments(1, false);
      } else {
        alert(response?.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Post comment error:', error);
      alert(error?.message || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) {
      alert('Comment cannot be empty');
      return;
    }
    try {
      const response = await API.updateComment(commentId, editText.trim());
      if (response?.success) {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: editText.trim() } : c));
        setEditingId(null);
        setEditText('');
      } else {
        alert(response?.message || 'Failed to update comment');
      }
    } catch (error) {
      console.error('Update comment error:', error);
      alert(error?.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const response = await API.deleteComment(commentId);
      if (response?.success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      } else {
        alert(response?.message || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Delete comment error:', error);
      alert(error?.message || 'Failed to delete comment');
    }
  };

  const handleToggleLike = async (commentId) => {
    // Optimistic update since backend doesn't echo back the new like state/count
    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c;
      const nowLiked = !c.isLiked;
      return { ...c, isLiked: nowLiked, likeCount: c.likeCount + (nowLiked ? 1 : -1) };
    }));

    try {
      const response = await API.toggleCommentLike(commentId);
      if (!response?.success) {
        // revert on failure
        setComments(prev => prev.map(c => {
          if (c.id !== commentId) return c;
          const revertedLiked = !c.isLiked;
          return { ...c, isLiked: revertedLiked, likeCount: c.likeCount + (revertedLiked ? 1 : -1) };
        }));
      }
    } catch (error) {
      console.error('Toggle comment like error:', error);
      // revert on error
      setComments(prev => prev.map(c => {
        if (c.id !== commentId) return c;
        const revertedLiked = !c.isLiked;
        return { ...c, isLiked: revertedLiked, likeCount: c.likeCount + (revertedLiked ? 1 : -1) };
      }));
    }
  };

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">
        {comments.length > 0 ? `${comments.length} Comments` : 'Comments'}
      </h3>

      <div className="comment-add-row">
        <img
          className="comment-avatar"
          src={user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'}
          alt="you"
        />
        <div className="comment-add-input-wrap">
          <textarea
            className="comment-add-input"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          {newComment.trim() && (
            <div className="comment-add-actions">
              <button className="comment-cancel-btn" onClick={() => setNewComment('')}>Cancel</button>
              <button className="comment-post-btn" disabled={posting} onClick={handlePostComment}>
                {posting ? 'Posting...' : 'Comment'}
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="comment-loading">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="comment-empty">No comments yet. Be the first to comment!</div>
      ) : (
        <div className="comment-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <img className="comment-avatar" src={comment.avatar} alt={comment.username} />
              <div className="comment-body">
                <div className="comment-meta">
                  <span className="comment-username">@{comment.username}</span>
                  <span className="comment-time">{getTimeAgo(comment.createdAt)}</span>
                </div>

                {editingId === comment.id ? (
                  <div className="comment-edit-box">
                    <textarea
                      className="comment-edit-input"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                    />
                    <div className="comment-edit-actions">
                      <button className="comment-cancel-btn" onClick={cancelEdit}>Cancel</button>
                      <button className="comment-post-btn" onClick={() => handleUpdateComment(comment.id)}>Save</button>
                    </div>
                  </div>
                ) : (
                  <p className="comment-text">{comment.content}</p>
                )}

                <div className="comment-actions">
                  <button
                    className={`comment-like-btn ${comment.isLiked ? 'liked' : ''}`}
                    onClick={() => handleToggleLike(comment.id)}
                  >
                    <i className={`fas fa-heart ${comment.isLiked ? 'liked' : ''}`}></i>
                    <span>{comment.likeCount > 0 ? comment.likeCount : ''}</span>
                  </button>

                  {comment.userId === user?._id && editingId !== comment.id && (
                    <>
                      <button className="comment-edit-btn" onClick={() => startEdit(comment)}>
                        <i className="fas fa-pen"></i> Edit
                      </button>
                      <button className="comment-delete-btn" onClick={() => handleDeleteComment(comment.id)}>
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <button className="comment-load-more" onClick={handleLoadMore}>
              Load more comments
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CommentSection;