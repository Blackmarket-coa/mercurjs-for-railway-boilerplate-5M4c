import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

/**
 * Signup redirect - redirects to /register
 * This allows /signup URLs to work as an alias for /register
 */
export const Signup = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  useEffect(() => {
    // Preserve any query parameters when redirecting
    const queryString = searchParams.toString()
    const redirectUrl = queryString ? `/register?${queryString}` : "/register"
    navigate(redirectUrl, { replace: true })
  }, [navigate, searchParams])
  
  return null
}
