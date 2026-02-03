import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ShareButtons from '../components/ShareButtons';

const BlogDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const response = await axios.get(`/api/posts/${id}`);
      setPost(response.data);
    };

    fetchPost();
  }, [id]);

  if (!post) return <div>Loading...</div>;

  return (
    <div className="blog-detail">
      <h1>{post.title}</h1>
      <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      
      <ShareButtons 
        url={window.location.href}
        title={post.title}
        description={post.excerpt}
      />

      <div className="related-posts">
        <h3>Related Posts</h3>
        {/* ...existing related posts code... */}
      </div>
    </div>
  );
};

export default BlogDetail;