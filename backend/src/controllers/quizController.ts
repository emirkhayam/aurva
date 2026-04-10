import { Request, Response } from 'express';
import { getSupabaseClient } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { CabinetAuthRequest } from '../middleware/cabinetAuth';

// ==================== ADMIN ENDPOINTS ====================

/**
 * List all quizzes with optional course_id/lesson_id filter
 */
export const getQuizzes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { course_id, lesson_id } = req.query;
    const supabase = getSupabaseClient();

    let query = supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });

    if (course_id) {
      query = query.eq('course_id', Number(course_id));
    }
    if (lesson_id) {
      query = query.eq('lesson_id', Number(lesson_id));
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get quiz with questions and options
 */
export const getQuizById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', Number(id))
      .single();

    if (quizError) throw quizError;
    if (!quiz) {
      res.status(404).json({ success: false, error: 'Quiz not found' });
      return;
    }

    // Get questions
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quiz.id)
      .order('order_index', { ascending: true });

    if (questionsError) throw questionsError;

    // Get options for all questions
    const questionIds = (questions || []).map((q: any) => q.id);
    let options: any[] = [];

    if (questionIds.length > 0) {
      const { data: optionsData, error: optionsError } = await supabase
        .from('quiz_options')
        .select('*')
        .in('question_id', questionIds)
        .order('order_index', { ascending: true });

      if (optionsError) throw optionsError;
      options = optionsData || [];
    }

    // Attach options to questions
    const questionsWithOptions = (questions || []).map((q: any) => ({
      ...q,
      options: options.filter((o: any) => o.question_id === q.id),
    }));

    res.json({
      success: true,
      data: {
        ...quiz,
        questions: questionsWithOptions,
      },
    });
  } catch (error: any) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create quiz with questions + options in one request
 * Body: { title, description, lesson_id?, course_id?, passing_score?, max_attempts?, time_limit_minutes?, questions: [{ question_text, question_type, explanation, order_index, points, options: [{ option_text, is_correct, order_index }] }] }
 */
export const createQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title, description, lesson_id, course_id,
      passing_score, max_attempts, time_limit_minutes,
      questions,
    } = req.body;

    if (!title) {
      res.status(400).json({ success: false, error: 'Title is required' });
      return;
    }

    const supabase = getSupabaseClient();

    // Create quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title,
        description: description || null,
        lesson_id: lesson_id || null,
        course_id: course_id || null,
        passing_score: passing_score || 70,
        max_attempts: max_attempts || 3,
        time_limit_minutes: time_limit_minutes || null,
        is_active: true,
      })
      .select()
      .single();

    if (quizError) throw quizError;

    // Create questions and options if provided
    const createdQuestions: any[] = [];

    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        const { data: question, error: qError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: quiz.id,
            question_text: q.question_text,
            question_type: q.question_type || 'single_choice',
            explanation: q.explanation || null,
            order_index: q.order_index ?? i,
            points: q.points || 1,
          })
          .select()
          .single();

        if (qError) throw qError;

        let createdOptions: any[] = [];
        if (q.options && Array.isArray(q.options)) {
          const optionsToInsert = q.options.map((o: any, idx: number) => ({
            question_id: question.id,
            option_text: o.option_text,
            is_correct: o.is_correct || false,
            order_index: o.order_index ?? idx,
          }));

          const { data: opts, error: oError } = await supabase
            .from('quiz_options')
            .insert(optionsToInsert)
            .select();

          if (oError) throw oError;
          createdOptions = opts || [];
        }

        createdQuestions.push({ ...question, options: createdOptions });
      }
    }

    res.status(201).json({
      success: true,
      data: { ...quiz, questions: createdQuestions },
    });
  } catch (error: any) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update quiz info
 */
export const updateQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title, description, lesson_id, course_id,
      passing_score, max_attempts, time_limit_minutes, is_active,
    } = req.body;

    const supabase = getSupabaseClient();

    const updateData: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (lesson_id !== undefined) updateData.lesson_id = lesson_id;
    if (course_id !== undefined) updateData.course_id = course_id;
    if (passing_score !== undefined) updateData.passing_score = passing_score;
    if (max_attempts !== undefined) updateData.max_attempts = max_attempts;
    if (time_limit_minutes !== undefined) updateData.time_limit_minutes = time_limit_minutes;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: quiz, error } = await supabase
      .from('quizzes')
      .update(updateData)
      .eq('id', Number(id))
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: quiz });
  } catch (error: any) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete quiz (cascade deletes questions and options)
 */
export const deleteQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', Number(id));

    if (error) throw error;

    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Add question to quiz
 * Body: { question_text, question_type?, explanation?, order_index?, points?, options: [{ option_text, is_correct, order_index }] }
 */
export const addQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const { question_text, question_type, explanation, order_index, points, options } = req.body;

    if (!question_text) {
      res.status(400).json({ success: false, error: 'Question text is required' });
      return;
    }

    const supabase = getSupabaseClient();

    const { data: question, error: qError } = await supabase
      .from('quiz_questions')
      .insert({
        quiz_id: Number(quizId),
        question_text,
        question_type: question_type || 'single_choice',
        explanation: explanation || null,
        order_index: order_index || 0,
        points: points || 1,
      })
      .select()
      .single();

    if (qError) throw qError;

    let createdOptions: any[] = [];
    if (options && Array.isArray(options)) {
      const optionsToInsert = options.map((o: any, idx: number) => ({
        question_id: question.id,
        option_text: o.option_text,
        is_correct: o.is_correct || false,
        order_index: o.order_index ?? idx,
      }));

      const { data: opts, error: oError } = await supabase
        .from('quiz_options')
        .insert(optionsToInsert)
        .select();

      if (oError) throw oError;
      createdOptions = opts || [];
    }

    res.status(201).json({
      success: true,
      data: { ...question, options: createdOptions },
    });
  } catch (error: any) {
    console.error('Error adding question:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update question + options
 * Body: { question_text?, question_type?, explanation?, order_index?, points?, options?: [{ id?, option_text, is_correct, order_index }] }
 */
export const updateQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { question_text, question_type, explanation, order_index, points, options } = req.body;

    const supabase = getSupabaseClient();

    const updateData: any = {};
    if (question_text !== undefined) updateData.question_text = question_text;
    if (question_type !== undefined) updateData.question_type = question_type;
    if (explanation !== undefined) updateData.explanation = explanation;
    if (order_index !== undefined) updateData.order_index = order_index;
    if (points !== undefined) updateData.points = points;

    const { data: question, error: qError } = await supabase
      .from('quiz_questions')
      .update(updateData)
      .eq('id', Number(id))
      .select()
      .single();

    if (qError) throw qError;

    // If options are provided, replace all options
    if (options && Array.isArray(options)) {
      // Delete existing options
      const { error: deleteError } = await supabase
        .from('quiz_options')
        .delete()
        .eq('question_id', Number(id));

      if (deleteError) throw deleteError;

      // Insert new options
      const optionsToInsert = options.map((o: any, idx: number) => ({
        question_id: Number(id),
        option_text: o.option_text,
        is_correct: o.is_correct || false,
        order_index: o.order_index ?? idx,
      }));

      const { data: newOptions, error: oError } = await supabase
        .from('quiz_options')
        .insert(optionsToInsert)
        .select();

      if (oError) throw oError;

      res.json({
        success: true,
        data: { ...question, options: newOptions },
      });
      return;
    }

    res.json({ success: true, data: question });
  } catch (error: any) {
    console.error('Error updating question:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete question (cascade deletes options)
 */
export const deleteQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', Number(id));

    if (error) throw error;

    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting question:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==================== CLIENT ENDPOINTS ====================

/**
 * Get quiz for a lesson (without correct answers!)
 */
export const getQuizForLesson = async (req: CabinetAuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const supabase = getSupabaseClient();

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', Number(lessonId))
      .eq('is_active', true)
      .single();

    if (quizError) {
      if (quizError.code === 'PGRST116') {
        res.status(404).json({ success: false, error: 'No quiz found for this lesson' });
        return;
      }
      throw quizError;
    }

    // Get questions
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quiz.id)
      .order('order_index', { ascending: true });

    if (questionsError) throw questionsError;

    // Get options WITHOUT is_correct field
    const questionIds = (questions || []).map((q: any) => q.id);
    let options: any[] = [];

    if (questionIds.length > 0) {
      const { data: optionsData, error: optionsError } = await supabase
        .from('quiz_options')
        .select('id, question_id, option_text, order_index')
        .in('question_id', questionIds)
        .order('order_index', { ascending: true });

      if (optionsError) throw optionsError;
      options = optionsData || [];
    }

    // Attach options to questions (without explanations for client)
    const questionsForClient = (questions || []).map((q: any) => ({
      id: q.id,
      quiz_id: q.quiz_id,
      question_text: q.question_text,
      question_type: q.question_type,
      order_index: q.order_index,
      points: q.points,
      options: options.filter((o: any) => o.question_id === q.id),
    }));

    res.json({
      success: true,
      data: {
        id: quiz.id,
        lesson_id: quiz.lesson_id,
        course_id: quiz.course_id,
        title: quiz.title,
        description: quiz.description,
        passing_score: quiz.passing_score,
        max_attempts: quiz.max_attempts,
        time_limit_minutes: quiz.time_limit_minutes,
        questions: questionsForClient,
      },
    });
  } catch (error: any) {
    console.error('Error fetching quiz for lesson:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Submit quiz attempt
 * Body: { answers: [{ question_id, selected_option_ids: [number] }] }
 */
export const submitQuizAttempt = async (req: CabinetAuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const userId = req.clientUser?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!answers || !Array.isArray(answers)) {
      res.status(400).json({ success: false, error: 'Answers array is required' });
      return;
    }

    const supabase = getSupabaseClient();

    // Get quiz info
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', Number(quizId))
      .eq('is_active', true)
      .single();

    if (quizError) throw quizError;
    if (!quiz) {
      res.status(404).json({ success: false, error: 'Quiz not found' });
      return;
    }

    // Check max attempts
    const { count, error: countError } = await supabase
      .from('user_quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('quiz_id', Number(quizId));

    if (countError) throw countError;

    if (quiz.max_attempts && (count || 0) >= quiz.max_attempts) {
      res.status(400).json({ success: false, error: 'Maximum attempts reached' });
      return;
    }

    // Get questions with correct options
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', Number(quizId));

    if (questionsError) throw questionsError;

    const questionIds = (questions || []).map((q: any) => q.id);
    const { data: allOptions, error: optionsError } = await supabase
      .from('quiz_options')
      .select('*')
      .in('question_id', questionIds);

    if (optionsError) throw optionsError;

    // Calculate score
    let score = 0;
    let maxScore = 0;

    const gradedAnswers = answers.map((answer: any) => {
      const question = (questions || []).find((q: any) => q.id === answer.question_id);
      if (!question) return { ...answer, correct: false, points_earned: 0 };

      maxScore += question.points;

      const correctOptionIds = (allOptions || [])
        .filter((o: any) => o.question_id === answer.question_id && o.is_correct)
        .map((o: any) => o.id);

      const selectedIds = answer.selected_option_ids || [];

      // Check if answer is correct
      const isCorrect =
        selectedIds.length === correctOptionIds.length &&
        selectedIds.every((id: number) => correctOptionIds.includes(id));

      if (isCorrect) {
        score += question.points;
      }

      return {
        question_id: answer.question_id,
        selected_option_ids: selectedIds,
        correct_option_ids: correctOptionIds,
        correct: isCorrect,
        points_earned: isCorrect ? question.points : 0,
        explanation: question.explanation,
      };
    });

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passed = percentage >= (quiz.passing_score || 70);

    // Save attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('user_quiz_attempts')
      .insert({
        user_id: userId,
        quiz_id: Number(quizId),
        score,
        max_score: maxScore,
        passed,
        answers: gradedAnswers,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (attemptError) throw attemptError;

    res.json({
      success: true,
      data: {
        ...attempt,
        percentage,
        passing_score: quiz.passing_score,
      },
    });
  } catch (error: any) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get user's quiz attempts
 */
export const getMyAttempts = async (req: CabinetAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.clientUser?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { quiz_id } = req.query;
    const supabase = getSupabaseClient();

    let query = supabase
      .from('user_quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (quiz_id) {
      query = query.eq('quiz_id', Number(quiz_id));
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
