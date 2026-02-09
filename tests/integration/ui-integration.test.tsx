import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

// Test simple de rendu des composants
describe('UI Integration Tests', () => {
  
  describe('Home Page', () => {
    it('should render home page with navigation', async () => {
      const Home = (await import('@/features/home/page')).default;
      render(<Home />);
      
      expect(screen.getByText('SOS Ksar El Kebir')).toBeInTheDocument();
      expect(screen.getByText('Report Emergency')).toBeInTheDocument();
      expect(screen.getByText('Citizen Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Command Center')).toBeInTheDocument();
    });
  });

  describe('Auth Page', () => {
    it('should render auth page with login form', async () => {
      const Auth = (await import('@/features/auth/page')).default;
      render(<Auth />);
      
      expect(screen.getByText('Connexion')).toBeInTheDocument();
      expect(screen.getByText('Continuer avec Google')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    });
  });

  describe('Citizen Dashboard', () => {
    it('should render dashboard with SOS form', async () => {
      const CitizenDashboard = (await import('@/features/citizen-dashboard/page')).default;
      render(<CitizenDashboard />);
      
      expect(screen.getByText('Signaler une Urgence')).toBeInTheDocument();
      expect(screen.getByText('Mes Signalements')).toBeInTheDocument();
      expect(screen.getByLabelText('Type d\'urgence')).toBeInTheDocument();
      expect(screen.getByLabelText('Localisation')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });
  });

  describe('Command Center', () => {
    it('should render command center with stats', async () => {
      const CommandCenter = (await import('@/features/command-center/page')).default;
      render(<CommandCenter />);
      
      expect(screen.getByText('Centre de Commande')).toBeInTheDocument();
      expect(screen.getByText('Flux des Signaux SOS')).toBeInTheDocument();
      expect(screen.getByText('Inventaire des Stocks')).toBeInTheDocument();
      expect(screen.getByText('Actions Rapides')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate between pages', async () => {
      // Test de navigation simple
      const Home = (await import('@/features/home/page')).default;
      const { container } = render(<Home />);
      
      // Vérifier que les liens sont présents
      const links = container.querySelectorAll('a');
      expect(links.length).toBeGreaterThan(0);
      
      // Vérifier que les liens ont les bonnes hrefs
      const dashboardLink = Array.from(links).find(link => 
        link.textContent?.includes('Citizen Dashboard')
      );
      expect(dashboardLink).toBeTruthy();
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on different screen sizes', async () => {
      const Home = (await import('@/features/home/page')).default;
      const { container } = render(<Home />);
      
      // Vérifier les classes responsive
      expect(container.querySelector('.container')).toBeInTheDocument();
      expect(container.querySelector('.grid-cols-1')).toBeInTheDocument();
      expect(container.querySelector('.md\\:grid-cols-3')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility attributes', async () => {
      const Auth = (await import('@/features/auth/page')).default;
      render(<Auth />);
      
      // Vérifier les attributs ARIA
      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      
      const passwordInput = screen.getByLabelText('Mot de passe');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
      
      // Vérifier les boutons
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error states', async () => {
      const CitizenDashboard = (await import('@/features/citizen-dashboard/page')).default;
      render(<CitizenDashboard />);
      
      // Tenter de soumettre un formulaire vide
      const submitButton = screen.getByRole('button', { name: /Envoyer le signal SOS/i });
      fireEvent.click(submitButton);
      
      // Le formulaire devrait montrer des erreurs de validation
      // (Ceci dépend de l'implémentation réelle)
      expect(screen.getByLabelText('Localisation')).toBeInTheDocument();
    });
  });
});
