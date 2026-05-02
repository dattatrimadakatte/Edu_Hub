-- Initialize sample achievements
INSERT INTO achievements (name, description, icon, points) VALUES
('First Steps', 'Complete your first course', '🎯', 10),
('Knowledge Seeker', 'Complete 5 courses', '📚', 50),
('Study Streak', 'Study for 7 consecutive days', '🔥', 25),
('Master Learner', 'Complete 10 courses', '🏆', 100),
('Community Helper', 'Help 10 students in forum', '🤝', 75),
('Speed Learner', 'Complete a course in under 24 hours', '⚡', 40)
ON CONFLICT DO NOTHING;

-- Initialize sample courses
INSERT INTO courses (title, description, category, instructor_id, created_at) VALUES
('React Fundamentals', 'Learn the basics of React development', 'Web Development', 
 (SELECT id FROM users WHERE role = 'instructor' LIMIT 1), NOW()),
('Python for Data Science', 'Master Python for data analysis and machine learning', 'Data Science',
 (SELECT id FROM users WHERE role = 'instructor' LIMIT 1), NOW()),
('JavaScript Advanced Concepts', 'Deep dive into advanced JavaScript topics', 'Web Development',
 (SELECT id FROM users WHERE role = 'instructor' LIMIT 1), NOW())
ON CONFLICT DO NOTHING;