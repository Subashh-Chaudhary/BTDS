import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { Scan } from '../scans/entities/scan.entity';
import { Experts } from '../expert/entities/expert.entity';
import { Reports } from '../reports/entities/report.entity';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
    @InjectRepository(Scan)
    private readonly scansRepo: Repository<Scan>,
    @InjectRepository(Experts)
    private readonly expertsRepo: Repository<Experts>,
    @InjectRepository(Reports)
    private readonly reportsRepo: Repository<Reports>,
  ) {}

  async createFeedback(expertId: string, scanId: string, data: { feedback_text: string }) {
    const scan = await this.scansRepo.findOne({ where: { id: scanId } });
    if (!scan) throw new NotFoundException('Scan not found');

    const expert = await this.expertsRepo.findOne({ where: { id: expertId } });
    if (!expert) throw new NotFoundException('Expert not found');

    const entity = this.feedbackRepo.create({
      scan,
      scan_id: scan.id,
      expert,
      expert_id: expert.id,
      feedback_text: data.feedback_text,
      verified_at: new Date(),
    });

    return this.feedbackRepo.save(entity);
  }

  async createFeedbackForReport(
    expertIdentifier: string | number | Record<string, any>,
    reportId: string,
    data: { feedback_text: string },
  ) {
    const report = await this.reportsRepo.findOne({ where: { id: reportId }, relations: ['scan'] });
    if (!report) throw new NotFoundException('Report not found');

    // debug: log incoming expertIdentifier and report id
    // eslint-disable-next-line no-console
    console.log('[DEBUG] FeedbacksService.createFeedbackForReport - expertIdentifier:', expertIdentifier, 'reportId:', reportId);

    // Resolve expert entity robustly: accept object (possibly request.user), uuid string, numeric legacy id, or email
    let expert: Experts | null = null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (typeof expertIdentifier === 'object' && expertIdentifier !== null) {
      // If it's already an entity-like object with id, try to find by id
      if (expertIdentifier.id && typeof expertIdentifier.id === 'string' && uuidRegex.test(expertIdentifier.id)) {
        expert = await this.expertsRepo.findOne({ where: { id: expertIdentifier.id } });
      }
      // else if the payload contains email, try that
      if (!expert && expertIdentifier.email) {
        expert = await this.expertsRepo.findOne({ where: { email: expertIdentifier.email } });
      }
    } else if (typeof expertIdentifier === 'string') {
      if (uuidRegex.test(expertIdentifier)) {
        expert = await this.expertsRepo.findOne({ where: { id: expertIdentifier } });
      } else {
        // treat string as an email fallback
        expert = await this.expertsRepo.findOne({ where: { email: expertIdentifier } });
      }
    } else if (typeof expertIdentifier === 'number') {
      // legacy numeric id — try to resolve via email is not possible here; try by id anyway (may fail)
      expert = await this.expertsRepo.findOne({ where: { id: expertIdentifier as any } });
    }

    // debug: log the expert entity returned (may reveal numeric PKs)
    // eslint-disable-next-line no-console
    console.log('[DEBUG] FeedbacksService.createFeedbackForReport - expert entity:', expert);
    if (!expert) throw new NotFoundException('Expert not found');

    // Prefer linking to both report and its scan (if present)
    const payload: DeepPartial<Feedback> = {
      // rely on relations to set FK columns to avoid type mismatches
      report,
      scan: report.scan,
      expert,
      feedback_text: data.feedback_text,
      verified_at: new Date(),
    };

    const entity = this.feedbackRepo.create(payload);

    const saved = await this.feedbackRepo.save(entity);

    // Update report.feedback_id if null or different
    if ((report as any).feedback_id !== saved.id) {
      await this.reportsRepo.update(report.id, { feedback_id: saved.id } as any);
    }

    return saved;
  }

  async findByScan(scanId: string) {
    return this.feedbackRepo.find({ where: { scan: { id: scanId } }, relations: ['expert', 'scan'] });
  }

  async findByReport(reportId: string) {
    return this.feedbackRepo.find({ where: { report: { id: reportId } }, relations: ['expert', 'scan', 'report'] });
  }

  async findOne(id: string) {
    const fb = await this.feedbackRepo.findOne({ where: { id }, relations: ['expert', 'scan'] });
    if (!fb) throw new NotFoundException('Feedback not found');
    return fb;
  }

  async updateFeedback(id: string, expertId: string, data: Partial<Feedback>) {
    const fb = await this.findOne(id);
    if (fb.expert_id !== expertId) throw new ForbiddenException('Not allowed to modify this feedback');
    await this.feedbackRepo.update(id, { feedback_text: data.feedback_text ?? fb.feedback_text, verified_at: new Date() } as any);
    return this.findOne(id);
  }

  async removeFeedback(id: string, expertId: string) {
    const fb = await this.findOne(id);
    if (fb.expert_id !== expertId) throw new ForbiddenException('Not allowed to remove this feedback');
    await this.feedbackRepo.remove(fb);
    return { id };
  }
}
