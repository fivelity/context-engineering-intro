"""
AI Layout API - Google Genkit integration for intelligent widget arrangement
Provides layout suggestions and optimization endpoints
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from ..services.ai_service import AIService
from ..models.layout_models import (
    AILayoutRequest, 
    AILayoutSuggestion, 
    ApplyAILayoutRequest,
    LayoutMetrics
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/ai",
    tags=["AI Layout"]
)

# Dependency to get AI service
async def get_ai_service() -> AIService:
    """Get AI service instance"""
    return AIService()


@router.get("/status")
async def get_ai_status(ai_service: AIService = Depends(get_ai_service)):
    """Get AI service availability and status"""
    try:
        status = await ai_service.get_status()
        return {
            "available": status.get("available", False),
            "provider": status.get("provider", "genkit"),
            "model": status.get("model", "gemini-pro"),
            "version": status.get("version", "1.0.0"),
            "capabilities": status.get("capabilities", [
                "layout_generation",
                "layout_optimization",
                "context_analysis"
            ]),
            "limits": status.get("limits", {
                "requests_per_hour": 100,
                "max_widgets": 50,
                "max_complexity": 5
            }),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to get AI status: {e}")
        return {
            "available": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.post("/layout-suggestions", response_model=List[AILayoutSuggestion])
async def generate_layout_suggestions(
    request: AILayoutRequest,
    ai_service: AIService = Depends(get_ai_service)
):
    """Generate AI-powered layout suggestions"""
    try:
        # Validate request
        if not request.currentLayout or not request.preferences:
            raise HTTPException(
                status_code=400, 
                detail="Missing required fields: currentLayout or preferences"
            )
        
        # Check widget count limits
        widget_count = len(request.currentLayout.widgets)
        if widget_count > 50:
            raise HTTPException(
                status_code=400, 
                detail="Too many widgets: maximum 50 widgets supported"
            )
        
        logger.info(f"Generating AI layout suggestions for {widget_count} widgets")
        
        # Generate suggestions using AI service
        suggestions = await ai_service.generate_layout_suggestions(request)
        
        if not suggestions:
            # Return fallback suggestions if AI service fails
            suggestions = await ai_service.generate_fallback_suggestions(request)
        
        logger.info(f"Generated {len(suggestions)} layout suggestions")
        return suggestions
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate layout suggestions: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"AI service error: {str(e)}"
        )


@router.post("/apply-layout")
async def apply_layout_suggestion(
    request: ApplyAILayoutRequest,
    ai_service: AIService = Depends(get_ai_service)
):
    """Apply AI layout suggestion with optional modifications"""
    try:
        if not request.suggestionId:
            raise HTTPException(
                status_code=400, 
                detail="Missing suggestionId"
            )
        
        logger.info(f"Applying AI layout suggestion: {request.suggestionId}")
        
        # Apply layout using AI service
        applied_layout = await ai_service.apply_layout_suggestion(request)
        
        if not applied_layout:
            raise HTTPException(
                status_code=404, 
                detail=f"Layout suggestion not found: {request.suggestionId}"
            )
        
        return {
            "success": True,
            "layout": applied_layout,
            "appliedAt": datetime.utcnow().isoformat(),
            "suggestionId": request.suggestionId
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to apply layout suggestion: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to apply layout: {str(e)}"
        )


@router.post("/optimize-layout")
async def optimize_layout(
    request: AILayoutRequest,
    ai_service: AIService = Depends(get_ai_service)
):
    """Optimize existing layout for better performance or aesthetics"""
    try:
        if not request.currentLayout:
            raise HTTPException(
                status_code=400, 
                detail="Missing currentLayout"
            )
        
        logger.info("Optimizing layout with AI")
        
        # Generate optimization suggestions
        optimizations = await ai_service.optimize_layout(request)
        
        return {
            "suggestions": optimizations,
            "originalMetrics": await ai_service.calculate_layout_metrics(request.currentLayout),
            "optimizedAt": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to optimize layout: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Layout optimization failed: {str(e)}"
        )


@router.post("/analyze-layout")
async def analyze_layout(
    layout_data: dict,
    ai_service: AIService = Depends(get_ai_service)
):
    """Analyze layout and provide insights"""
    try:
        analysis = await ai_service.analyze_layout(layout_data)
        
        return {
            "analysis": analysis,
            "insights": analysis.get("insights", []),
            "recommendations": analysis.get("recommendations", []),
            "metrics": analysis.get("metrics", {}),
            "analyzedAt": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to analyze layout: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Layout analysis failed: {str(e)}"
        )


@router.get("/suggestions/{suggestion_id}")
async def get_suggestion_details(
    suggestion_id: str,
    ai_service: AIService = Depends(get_ai_service)
):
    """Get detailed information about a specific suggestion"""
    try:
        suggestion = await ai_service.get_suggestion_details(suggestion_id)
        
        if not suggestion:
            raise HTTPException(
                status_code=404, 
                detail=f"Suggestion not found: {suggestion_id}"
            )
        
        return suggestion
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get suggestion details: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to retrieve suggestion: {str(e)}"
        )


@router.get("/models")
async def get_available_models(ai_service: AIService = Depends(get_ai_service)):
    """Get list of available AI models"""
    try:
        models = await ai_service.get_available_models()
        return {
            "models": models,
            "default": "gemini-pro",
            "recommended": "gemini-pro",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to get available models: {e}")
        return {
            "models": ["gemini-pro"],
            "default": "gemini-pro",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.post("/feedback")
async def submit_layout_feedback(
    feedback_data: dict,
    ai_service: AIService = Depends(get_ai_service)
):
    """Submit feedback on AI layout suggestions"""
    try:
        result = await ai_service.submit_feedback(feedback_data)
        
        return {
            "success": True,
            "message": "Feedback submitted successfully",
            "feedbackId": result.get("id"),
            "submittedAt": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to submit feedback: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to submit feedback: {str(e)}"
        )


# Health check endpoint
@router.get("/health")
async def ai_health_check(ai_service: AIService = Depends(get_ai_service)):
    """AI service health check"""
    try:
        health = await ai_service.health_check()
        
        return {
            "status": "healthy" if health.get("ok") else "unhealthy",
            "details": health,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"AI health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }