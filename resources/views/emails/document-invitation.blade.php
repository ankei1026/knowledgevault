
<!DOCTYPE html>
<html>
<head>
    <title>Invitation to Collaborate</title>
</head>
<body style="font-family: 'Inter', sans-serif; background: #F9F8F6; padding: 40px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #E8ECEF;">
        <div style="padding: 30px; border-bottom: 1px solid #E8ECEF;">
            <h2 style="font-family: 'Playfair Display', serif; color: #1A1A1A;">ASC KnowledgeVault</h2>
        </div>
        
        <div style="padding: 30px;">
            <h3 style="color: #1A1A1A;">Collaboration Invitation</h3>
            
            <p style="color: #6C6863;">Hello,</p>
            
            <p style="color: #6C6863;">
                <strong>{{ $invitation->inviter->name }}</strong> has invited you to be a 
                <strong>{{ $invitation->role === 'co-author' ? 'Co-author' : 'Reviewer' }}</strong> 
                on the document: <strong>{{ $document->title }}</strong>
            </p>
            
            @if($invitation->message)
                <div style="background: #F9F8F6; padding: 15px; margin: 20px 0; border-left: 3px solid #D4AF37;">
                    <p style="color: #1A1A1A; margin: 0;">"{{ $invitation->message }}"</p>
                </div>
            @endif
            
            <div style="margin-top: 30px;">
                <a href="{{ $acceptUrl }}" 
                   style="display: inline-block; background: #1A1A1A; color: white; padding: 12px 24px; text-decoration: none; margin-right: 15px;">
                    Accept Invitation
                </a>
                <a href="{{ $declineUrl }}" 
                   style="display: inline-block; background: transparent; color: #6C6863; padding: 12px 24px; text-decoration: none; border: 1px solid #E8ECEF;">
                    Decline
                </a>
            </div>
            
            <p style="color: #6C6863; font-size: 12px; margin-top: 30px;">
                This invitation will expire in 7 days.
            </p>
        </div>
    </div>
</body>
</html>