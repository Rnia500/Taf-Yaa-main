import { authService } from '../../services/authService';

export async function handleSignUp(formData, navigate, setError, setLoading) {
  try {
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (!formData.termsAccepted) {
      throw new Error('You must accept the terms of use and privacy policy.');
    }

    // Call auth service
  await authService.register(formData.email, formData.password, formData.displayName, {
      language: formData.language,
    });

    // Navigate on success
    navigate('/my-trees');

  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
}

export async function handleGoogleSignUp(navigate, setError, setLoading) {
  try {
    setError('');
    setLoading(true);

    // Call auth service for Google sign up
  await authService.loginWithGoogle();

    // Navigate on success
    navigate('/my-trees');

  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
}
