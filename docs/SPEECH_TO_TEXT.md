# Speech-to-Text Transcription with OpenAI Whisper

## Overview

LegallyAI includes automated speech-to-text transcription powered by OpenAI's Whisper model. This feature enables automatic transcription of:

- 📝 Legal consultations
- ⚖️ Court proceedings
- 🎥 Video depositions  
- 📹 Legal training videos
- 🗣️ Voice notes and memos
- 🎬 YouTube legal content

## Features

- **Multiple Models**: Choose from small, medium, or large models
- **High Accuracy**: State-of-the-art speech recognition
- **Multi-format**: Output as TXT, SRT (subtitles), or CSV
- **Translation**: Automatic translation to English
- **Privacy**: Runs on GitHub infrastructure (no third-party API)
- **Cost**: Free (uses GitHub Actions minutes)

---

## How to Use

### Method 1: GitHub Actions UI (Easiest)

1. Go to **Actions** tab in GitHub
2. Click **Speech to Text Transcription** workflow
3. Click **Run workflow**
4. Fill in the form:
   - **YouTube URL** OR **Audio file path** (choose one)
   - **Model**: small (fastest), medium (balanced), large (most accurate)
   - **Output format**: txt, srt, or csv
   - **Translate**: Check if you want translation to English
5. Click **Run workflow**
6. Wait for completion (2-10 minutes depending on length)
7. Download transcripts from **Artifacts** or check the `transcripts/` folder

### Method 2: Manual Trigger via GitHub CLI

```bash
gh workflow run transcribe-audio.yml \
  -f youtube_url="https://www.youtube.com/watch?v=VIDEO_ID" \
  -f model="small" \
  -f output_format="txt" \
  -f translate="false"
```

### Method 3: Transcribe Files in Repository

1. Upload your audio/video file to the repository (e.g., `audio/consultation.mp3`)
2. Run the workflow with:
   ```bash
   gh workflow run transcribe-audio.yml \
     -f audio_path="audio/consultation.mp3" \
     -f model="medium" \
     -f output_format="txt"
   ```

---

## Legal Use Cases

### 1. Client Consultations

**Scenario**: Record and transcribe initial client consultations

**Steps**:
1. Record consultation (with client consent)
2. Upload audio file to private repository
3. Run transcription workflow
4. Review and redact sensitive information
5. Store in case management system

**Best Practices**:
- ✅ Always get client consent before recording
- ✅ Store recordings securely
- ✅ Redact confidential information
- ✅ Follow attorney-client privilege rules

### 2. Court Proceedings

**Scenario**: Transcribe recorded court hearings

**Format**: Use SRT format for timestamped transcripts

```bash
gh workflow run transcribe-audio.yml \
  -f audio_path="recordings/hearing-2024-01-15.mp4" \
  -f model="large" \
  -f output_format="srt"
```

**Output** (SRT format):
```
1
00:00:00,000 --> 00:00:03,500
Your Honor, I'd like to present evidence A.

2
00:00:03,500 --> 00:00:07,200
Objection, Your Honor. This evidence is inadmissible.
```

### 3. Video Depositions

**Scenario**: Create searchable transcripts from video depositions

**Recommended Settings**:
- Model: `large` (highest accuracy for legal terminology)
- Format: `srt` (for synchronized video playback)
- Translate: `false` (unless original is not English)

### 4. Legal Training Content

**Scenario**: Transcribe YouTube legal education videos

**Example**:
```bash
gh workflow run transcribe-audio.yml \
  -f youtube_url="https://www.youtube.com/watch?v=legal-training-video" \
  -f model="small" \
  -f output_format="txt"
```

**Use Cases**:
- Create study materials
- Generate searchable knowledge base
- Accessibility compliance
- Multi-language support

### 5. Voice Notes to Text

**Scenario**: Convert dictated legal memos to text

**Workflow**:
1. Record voice memo on phone
2. Upload to repository as `memos/memo-YYYY-MM-DD.m4a`
3. Run transcription
4. Format and file

---

## Model Selection Guide

| Model | Speed | Accuracy | Memory | Best For |
|-------|-------|----------|--------|----------|
| **small** | ⚡ Fast | ✓ Good | 1GB | Quick notes, voice memos |
| **medium** | ⚖️ Balanced | ✓✓ Better | 3GB | General consultations |
| **large** | 🐌 Slow | ✓✓✓ Best | 6GB | Court proceedings, depositions |

**Recommendation**: 
- Start with `small` for testing
- Use `medium` for most legal work
- Use `large` only for critical proceedings where accuracy is paramount

---

## Output Formats

### TXT (Plain Text)

**Use**: General documentation, case notes

**Example Output**:
```
Your Honor, I'd like to present evidence A. Objection, Your Honor. This evidence is inadmissible. Overruled. Please proceed.
```

### SRT (Subtitles)

**Use**: Video depositions, training videos, timestamped records

**Example Output**:
```
1
00:00:00,000 --> 00:00:03,500
Your Honor, I'd like to present evidence A.

2
00:00:03,500 --> 00:00:07,200
Objection, Your Honor. This evidence is inadmissible.
```

### CSV (Structured Data)

**Use**: Data analysis, searchable databases

**Example Output**:
```csv
start_time,end_time,text
0.000,3.500,"Your Honor, I'd like to present evidence A."
3.500,7.200,"Objection, Your Honor. This evidence is inadmissible."
```

---

## Supported File Formats

**Audio**:
- MP3
- WAV
- M4A
- AAC
- FLAC
- OGG

**Video**:
- MP4
- AVI
- MOV
- MKV
- WebM

**YouTube**: Any public video URL

---

## Privacy & Compliance

### HIPAA Compliance

⚠️ **Important**: The GitHub Actions workflow uses GitHub's infrastructure. For HIPAA-compliant transcription:

1. **DO NOT** upload PHI (Protected Health Information) to public repositories
2. **DO** use private repositories
3. **CONSIDER** using self-hosted runners for sensitive content
4. **REDACT** all personal information before sharing transcripts

### Attorney-Client Privilege

✅ **Best Practices**:
- Mark all transcripts as "CONFIDENTIAL - ATTORNEY-CLIENT PRIVILEGED"
- Store in secure, private repositories
- Use access controls
- Regular security audits
- Encryption at rest and in transit

### Data Retention

- Transcripts stored in `transcripts/` folder
- Artifacts retained for 30 days (configurable)
- Original recordings should follow firm retention policies

---

## Advanced Configuration

### Custom Prompts

Add initial context to improve accuracy:

```yaml
- name: Transcribe with context
  uses: appleboy/whisper-action@v0.1.1
  with:
    model: medium
    audio_path: recording.mp3
    prompt: "Legal consultation regarding custody case involving minors"
    output_format: txt
```

### Cut Silences

Remove long pauses for cleaner transcripts:

```yaml
- name: Transcribe without silences
  uses: appleboy/whisper-action@v0.1.1
  with:
    model: small
    audio_path: recording.mp3
    cut_silences: true
```

### Translation

Automatically translate to English:

```yaml
- name: Transcribe and translate
  uses: appleboy/whisper-action@v0.1.1
  with:
    model: medium
    audio_path: spanish-consultation.mp3
    translate: true
```

---

## Troubleshooting

### Issue: Workflow fails with "File not found"

**Solution**: Ensure file path is relative to repository root

```bash
# ✅ Correct
audio_path: "recordings/file.mp3"

# ❌ Incorrect
audio_path: "/home/runner/recordings/file.mp3"
```

### Issue: Low accuracy for legal terms

**Solutions**:
1. Use `large` model instead of `small`
2. Improve audio quality (reduce background noise)
3. Add legal context in `prompt` parameter
4. Speak clearly and slowly

### Issue: YouTube video too long

**Solution**: Whisper can handle long videos, but workflow may timeout. Split into segments:

```bash
# Download and split first
yt-dlp -f bestaudio --split-duration 3600 VIDEO_URL
```

### Issue: Out of memory error

**Solution**: Use smaller model or increase runner size

```yaml
runs-on: ubuntu-latest-4-cores  # More resources
```

---

## Cost Analysis

### GitHub Actions Minutes

**Free Tier**: 2,000 minutes/month
**Pro**: 3,000 minutes/month

**Transcription Time**:
- Small model: ~0.2x realtime (10 min audio = 2 min processing)
- Medium model: ~0.5x realtime (10 min audio = 5 min processing)
- Large model: ~1.0x realtime (10 min audio = 10 min processing)

**Example Monthly Usage**:
- 10 consultations × 30 min each = 300 min audio
- Using medium model: ~150 min processing time
- Well within free tier! ✅

### Comparison to Manual Transcription

| Method | Cost | Time | Accuracy |
|--------|------|------|----------|
| **Manual Typing** | $1-3/min | 4x realtime | High |
| **Professional Service** | $0.50-2/min | 24-48 hrs | Very High |
| **Whisper (small)** | FREE | 0.2x realtime | Good |
| **Whisper (medium)** | FREE | 0.5x realtime | Very Good |
| **Whisper (large)** | FREE | 1.0x realtime | Excellent |

**Savings**: Up to $900/month for 10 consultations! 💰

---

## Integration with LegallyAI

### Future Enhancements

1. **Web UI**: Upload and transcribe directly from browser
2. **Real-time Transcription**: Live transcription during consultations
3. **Speaker Diarization**: Identify different speakers
4. **Legal Terminology**: Fine-tuned model for legal language
5. **Automatic Redaction**: AI-powered PII removal
6. **Case Integration**: Auto-link transcripts to cases

### API Integration (Coming Soon)

```typescript
// Future API endpoint
const transcript = await supabase.functions.invoke('transcribe-audio', {
  body: {
    audioUrl: 'https://storage.url/recording.mp3',
    model: 'medium',
    format: 'txt'
  }
});
```

---

## Security Checklist

Before transcribing sensitive content:

- [ ] Using private repository
- [ ] Client consent obtained for recording
- [ ] Audio files encrypted at rest
- [ ] Access controls configured
- [ ] Retention policy defined
- [ ] Backup strategy in place
- [ ] Compliance requirements reviewed
- [ ] Team members trained on privacy

---

## Resources

- [OpenAI Whisper Documentation](https://github.com/openai/whisper)
- [Whisper.cpp (C++ implementation)](https://github.com/ggerganov/whisper.cpp)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Legal Technology Best Practices](https://www.americanbar.org/groups/law_practice/resources/technology/)

---

## Support

**Questions?** 
- Check [GitHub Discussions](https://github.com/Legallyai-1/legallyai-nexus-4b3048fb/discussions)
- Review workflow logs in Actions tab
- Contact support@legallyai.ai

---

**Last Updated**: 2026-02-09  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
