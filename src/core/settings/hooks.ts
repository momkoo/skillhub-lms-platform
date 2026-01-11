// ============================================
// Core: 설정 관리 - React Hooks
// ============================================

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { 
  SettingPublic, 
  HomepageBlockPublic,
  SettingsGroup,
  SettingUpdateInput,
  HomepageBlockInput,
  SettingGroupKey,
  SETTING_GROUP_LABELS
} from './types';

// API 함수
const api = {
  async getSettings(group?: string): Promise<SettingPublic[]> {
    const params = group ? `?group=${group}` : '';
    const res = await fetch(`/api/settings${params}`);
    if (!res.ok) throw new Error('설정을 가져올 수 없습니다.');
    return res.json();
  },

  async getSettingsGrouped(): Promise<SettingsGroup[]> {
    const res = await fetch('/api/settings/grouped');
    if (!res.ok) throw new Error('그룹화된 설정을 가져올 수 없습니다.');
    return res.json();
  },

  async updateSetting(data: SettingUpdateInput): Promise<SettingPublic> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '설정 업데이트에 실패했습니다.');
    }
    return res.json();
  },

  async updateSettings(data: SettingUpdateInput[]): Promise<SettingPublic[]> {
    const res = await fetch('/api/settings/bulk', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '설정 일괄 업데이트에 실패했습니다.');
    }
    return res.json();
  },

  async resetSetting(key: string): Promise<void> {
    const res = await fetch(`/api/settings/${key}/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('설정 초기화에 실패했습니다.');
  },

  // Homepage Blocks
  async getHomepageBlocks(area?: string): Promise<HomepageBlockPublic[]> {
    const params = area ? `?area=${area}` : '';
    const res = await fetch(`/api/settings/homepage${params}`);
    if (!res.ok) throw new Error('홈페이지 블록을 가져올 수 없습니다.');
    return res.json();
  },

  async createHomepageBlock(data: HomepageBlockInput): Promise<HomepageBlockPublic> {
    const res = await fetch('/api/settings/homepage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '블록 생성에 실패했습니다.');
    }
    return res.json();
  },

  async updateHomepageBlock(id: string, data: Partial<HomepageBlockInput>): Promise<HomepageBlockPublic> {
    const res = await fetch(`/api/settings/homepage/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '블록 업데이트에 실패했습니다.');
    }
    return res.json();
  },

  async deleteHomepageBlock(id: string): Promise<void> {
    const res = await fetch(`/api/settings/homepage/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '블록 삭제에 실패했습니다.');
    }
  },

  async reorderHomepageBlocks(blocks: { id: string; sortOrder: number }[]): Promise<void> {
    const res = await fetch('/api/settings/homepage/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    });
    if (!res.ok) throw new Error('블록 순서 변경에 실패했습니다.');
  },

  async toggleHomepageBlock(id: string, isActive: boolean): Promise<HomepageBlockPublic> {
    const res = await fetch(`/api/settings/homepage/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    if (!res.ok) throw new Error('블록 상태 변경에 실패했습니다.');
    return res.json();
  },

  // Export/Import
  async exportSettings(): Promise<Record<string, string>> {
    const res = await fetch('/api/settings/export');
    if (!res.ok) throw new Error('설정 내보내기에 실패했습니다.');
    return res.json();
  },

  async importSettings(data: Record<string, string>): Promise<void> {
    const res = await fetch('/api/settings/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('설정 가져오기에 실패했습니다.');
  },
};

// ============================================
// Settings Hook
// ============================================

interface UseSettingsReturn {
  settings: SettingPublic[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateSetting: (key: string, value: string) => Promise<SettingPublic>;
  updateSettings: (data: SettingUpdateInput[]) => Promise<SettingPublic[]>;
  resetSetting: (key: string) => Promise<void>;
}

export function useSettings(group?: string): UseSettingsReturn {
  const [settings, setSettings] = useState<SettingPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getSettings(group);
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [group]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettingFn = useCallback(async (key: string, value: string) => {
    const updated = await api.updateSetting({ key, value });
    await fetchSettings();
    return updated;
  }, [fetchSettings]);

  const updateSettingsFn = useCallback(async (data: SettingUpdateInput[]) => {
    const updated = await api.updateSettings(data);
    await fetchSettings();
    return updated;
  }, [fetchSettings]);

  const resetSettingFn = useCallback(async (key: string) => {
    await api.resetSetting(key);
    await fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    error,
    refresh: fetchSettings,
    updateSetting: updateSettingFn,
    updateSettings: updateSettingsFn,
    resetSetting: resetSettingFn,
  };
}

// ============================================
// Grouped Settings Hook
// ============================================

interface UseGroupedSettingsReturn {
  groups: SettingsGroup[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateSetting: (key: string, value: string) => Promise<SettingPublic>;
}

export function useGroupedSettings(): UseGroupedSettingsReturn {
  const [groups, setGroups] = useState<SettingsGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getSettingsGrouped();
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const updateSettingFn = useCallback(async (key: string, value: string) => {
    const updated = await api.updateSetting({ key, value });
    await fetchGroups();
    return updated;
  }, [fetchGroups]);

  return {
    groups,
    isLoading,
    error,
    refresh: fetchGroups,
    updateSetting: updateSettingFn,
  };
}

// ============================================
// Homepage Blocks Hook
// ============================================

interface UseHomepageBlocksReturn {
  blocks: HomepageBlockPublic[];
  isLoading: boolean;
  error: string | null;
  area: string | undefined;
  refresh: () => Promise<void>;
  createBlock: (data: HomepageBlockInput) => Promise<HomepageBlockPublic>;
  updateBlock: (id: string, data: Partial<HomepageBlockInput>) => Promise<HomepageBlockPublic>;
  deleteBlock: (id: string) => Promise<void>;
  reorderBlocks: (blocks: { id: string; sortOrder: number }[]) => Promise<void>;
  toggleBlock: (id: string, isActive: boolean) => Promise<HomepageBlockPublic>;
}

export function useHomepageBlocks(area?: string): UseHomepageBlocksReturn {
  const [blocks, setBlocks] = useState<HomepageBlockPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlocks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getHomepageBlocks(area);
      setBlocks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [area]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const createBlockFn = useCallback(async (data: HomepageBlockInput) => {
    const block = await api.createHomepageBlock(data);
    await fetchBlocks();
    return block;
  }, [fetchBlocks]);

  const updateBlockFn = useCallback(async (id: string, data: Partial<HomepageBlockInput>) => {
    const block = await api.updateHomepageBlock(id, data);
    await fetchBlocks();
    return block;
  }, [fetchBlocks]);

  const deleteBlockFn = useCallback(async (id: string) => {
    await api.deleteHomepageBlock(id);
    await fetchBlocks();
  }, [fetchBlocks]);

  const reorderBlocksFn = useCallback(async (blocksData: { id: string; sortOrder: number }[]) => {
    await api.reorderHomepageBlocks(blocksData);
    await fetchBlocks();
  }, [fetchBlocks]);

  const toggleBlockFn = useCallback(async (id: string, isActive: boolean) => {
    const block = await api.toggleHomepageBlock(id, isActive);
    await fetchBlocks();
    return block;
  }, [fetchBlocks]);

  return {
    blocks,
    isLoading,
    error,
    area,
    refresh: fetchBlocks,
    createBlock: createBlockFn,
    updateBlock: updateBlockFn,
    deleteBlock: deleteBlockFn,
    reorderBlocks: reorderBlocksFn,
    toggleBlock: toggleBlockFn,
  };
}

// ============================================
// Settings Import/Export Hook
// ============================================

export function useSettingsImportExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportSettingsFn = useCallback(async () => {
    setIsExporting(true);
    setError(null);
    try {
      const data = await api.exportSettings();
      
      // 파일 다운로드
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `settings-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  }, []);

  const importSettingsFn = useCallback(async (file: File) => {
    setIsImporting(true);
    setError(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await api.importSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '설정 파일 파싱에 실패했습니다.');
    } finally {
      setIsImporting(false);
    }
  }, []);

  return {
    isExporting,
    isImporting,
    error,
    exportSettings: exportSettingsFn,
    importSettings: importSettingsFn,
  };
}
