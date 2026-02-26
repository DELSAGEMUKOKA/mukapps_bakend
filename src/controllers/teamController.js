import supabase from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/helpers.js';

export const createTeam = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const companyId = req.user.companyId;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create teams'
      });
    }

    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        name,
        description,
        company_id: companyId
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: team,
      message: 'Team created successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getTeams = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        *,
        members:team_members(
          id,
          role,
          user:users(id, name, email)
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        members:team_members(
          id,
          role,
          created_at,
          user:users(id, name, email, role, phone)
        )
      `)
      .eq('id', id)
      .eq('company_id', companyId)
      .single();

    if (error) throw error;

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const companyId = req.user.companyId;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update teams'
      });
    }

    const { data: team, error } = await supabase
      .from('teams')
      .update({
        name,
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: team,
      message: 'Team updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete teams'
      });
    }

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const addTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    const companyId = req.user.companyId;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can add team members'
      });
    }

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', id)
      .eq('company_id', companyId)
      .single();

    if (teamError || !team) {
      throw new NotFoundError('Team not found');
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .eq('company_id', companyId)
      .single();

    if (userError || !user) {
      throw new NotFoundError('User not found');
    }

    const { data: member, error } = await supabase
      .from('team_members')
      .insert({
        team_id: id,
        user_id: userId,
        role: role || 'member'
      })
      .select(`
        *,
        user:users(id, name, email)
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new ValidationError({ member: 'User is already a member of this team' });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      data: member,
      message: 'Team member added successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const removeTeamMember = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;
    const companyId = req.user.companyId;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can remove team members'
      });
    }

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', id)
      .eq('company_id', companyId)
      .single();

    if (teamError || !team) {
      throw new NotFoundError('Team not found');
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('team_id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', id)
      .eq('company_id', companyId)
      .single();

    if (teamError || !team) {
      throw new NotFoundError('Team not found');
    }

    const { data: members, error } = await supabase
      .from('team_members')
      .select(`
        id,
        role,
        created_at,
        user:users(id, name, email, role, phone)
      `)
      .eq('team_id', id);

    if (error) throw error;

    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select(`
        *,
        members:team_members(id, user_id)
      `)
      .eq('id', id)
      .eq('company_id', companyId)
      .single();

    if (teamError || !team) {
      throw new NotFoundError('Team not found');
    }

    const memberCount = team.members?.length || 0;

    res.json({
      success: true,
      data: {
        team: {
          id: team.id,
          name: team.name,
          description: team.description
        },
        memberCount,
        createdAt: team.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeamMember = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;
    const { role } = req.body;
    const companyId = req.user.companyId;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update team members'
      });
    }

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', id)
      .eq('company_id', companyId)
      .single();

    if (teamError || !team) {
      throw new NotFoundError('Team not found');
    }

    const { data: member, error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('id', memberId)
      .eq('team_id', id)
      .select(`
        *,
        user:users(id, name, email)
      `)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: member,
      message: 'Team member updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
