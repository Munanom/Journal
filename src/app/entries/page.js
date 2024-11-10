'use client';
import React from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import EntriesPageContent from './EntriesPageContent';

export default function EntriesPage() {
  return (
    <ProtectedRoute>
      <EntriesPageContent />
    </ProtectedRoute>
  );
}
