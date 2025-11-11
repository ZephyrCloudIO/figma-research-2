/**
 * Block Semantic Mapping System
 *
 * Provides semantic schemas for common block patterns, defining their
 * compositional structure and how they map to code components.
 */

import { ComponentType } from './enhanced-figma-parser.js';
import { BlockCategory, BlockSubType } from './block-classifier.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface BlockComponentSlot {
  name: string;
  componentType: ComponentType | 'Container' | 'Wrapper';
  required: boolean;
  allowsMultiple: boolean;
  description: string;
  children?: BlockComponentSlot[];
  defaultProps?: Record<string, any>;
}

export interface BlockSchema {
  blockType: string;
  category: BlockCategory;
  subType: BlockSubType;
  description: string;
  structure: BlockComponentSlot[];
  wrapperComponent: string;
  importPath: string;
  tailwindClasses?: string[];
  usage: string;
}

// ============================================================================
// BLOCK SCHEMA REGISTRY
// ============================================================================

export class BlockSchemaRegistry {
  private static schemas: Map<string, BlockSchema> = new Map();

  /**
   * Initialize all block schemas
   */
  static initialize(): void {
    // Hero Blocks
    this.registerSchema(this.getHeroSimpleSchema());
    this.registerSchema(this.getHeroSplitSchema());
    this.registerSchema(this.getHeroCenteredSchema());

    // Feature Blocks
    this.registerSchema(this.getFeaturesGridSchema());
    this.registerSchema(this.getFeaturesWithIconsSchema());

    // Pricing Blocks
    this.registerSchema(this.getPricingCardsSchema());
    this.registerSchema(this.getPricingTableSchema());

    // Authentication Blocks
    this.registerSchema(this.getLoginFormSchema());
    this.registerSchema(this.getRegisterFormSchema());
    this.registerSchema(this.getForgotPasswordSchema());

    // Dashboard Blocks
    this.registerSchema(this.getDashboardStatsSchema());
    this.registerSchema(this.getDashboardHeaderSchema());

    // E-commerce Blocks
    this.registerSchema(this.getProductCardSchema());
    this.registerSchema(this.getProductListSchema());

    // Marketing Blocks
    this.registerSchema(this.getTestimonialsSchema());
    this.registerSchema(this.getCTASchema());
    this.registerSchema(this.getFooterSchema());
    this.registerSchema(this.getHeaderSchema());

    // Content Blocks
    this.registerSchema(this.getBlogCardSchema());
  }

  /**
   * Register a block schema
   */
  private static registerSchema(schema: BlockSchema): void {
    this.schemas.set(schema.blockType, schema);
  }

  /**
   * Get schema by block type
   */
  static getSchema(blockType: string): BlockSchema | undefined {
    return this.schemas.get(blockType);
  }

  /**
   * Get schema by category and subtype
   */
  static getSchemaByCategoryAndSubType(category: BlockCategory, subType: BlockSubType): BlockSchema | undefined {
    for (const schema of this.schemas.values()) {
      if (schema.category === category && schema.subType === subType) {
        return schema;
      }
    }
    return undefined;
  }

  /**
   * Get all schemas for a category
   */
  static getSchemasByCategory(category: BlockCategory): BlockSchema[] {
    const result: BlockSchema[] = [];
    for (const schema of this.schemas.values()) {
      if (schema.category === category) {
        result.push(schema);
      }
    }
    return result;
  }

  /**
   * Get all registered schemas
   */
  static getAllSchemas(): BlockSchema[] {
    return Array.from(this.schemas.values());
  }

  // ============================================================================
  // HERO BLOCK SCHEMAS
  // ============================================================================

  private static getHeroSimpleSchema(): BlockSchema {
    return {
      blockType: 'Hero-Simple',
      category: BlockCategory.HERO,
      subType: BlockSubType.HERO_SIMPLE,
      description: 'Simple hero section with heading, description, and CTA',
      wrapperComponent: 'section',
      importPath: '@/components/blocks/hero/hero-simple',
      tailwindClasses: ['w-full', 'py-12', 'md:py-24', 'lg:py-32'],
      structure: [
        {
          name: 'container',
          componentType: 'Container',
          required: true,
          allowsMultiple: false,
          description: 'Container wrapper',
          children: [
            {
              name: 'heading',
              componentType: 'Text',
              required: true,
              allowsMultiple: false,
              description: 'Main hero heading',
              defaultProps: { as: 'h1', size: '4xl' }
            },
            {
              name: 'description',
              componentType: 'Text',
              required: false,
              allowsMultiple: false,
              description: 'Hero description text',
              defaultProps: { as: 'p', size: 'lg' }
            },
            {
              name: 'cta-buttons',
              componentType: 'Container',
              required: true,
              allowsMultiple: false,
              description: 'CTA button group',
              children: [
                {
                  name: 'primary-button',
                  componentType: 'Button',
                  required: true,
                  allowsMultiple: false,
                  description: 'Primary CTA button'
                },
                {
                  name: 'secondary-button',
                  componentType: 'Button',
                  required: false,
                  allowsMultiple: false,
                  description: 'Secondary CTA button'
                }
              ]
            }
          ]
        }
      ],
      usage: 'Use for simple hero sections without images or complex layouts'
    };
  }

  private static getHeroSplitSchema(): BlockSchema {
    return {
      blockType: 'Hero-Split',
      category: BlockCategory.HERO,
      subType: BlockSubType.HERO_SPLIT,
      description: 'Hero section with split layout (text + image)',
      wrapperComponent: 'section',
      importPath: '@/components/blocks/hero/hero-split',
      tailwindClasses: ['w-full', 'py-12', 'md:py-24', 'lg:py-32'],
      structure: [
        {
          name: 'container',
          componentType: 'Container',
          required: true,
          allowsMultiple: false,
          description: 'Grid container',
          defaultProps: { className: 'grid md:grid-cols-2 gap-8' },
          children: [
            {
              name: 'text-content',
              componentType: 'Container',
              required: true,
              allowsMultiple: false,
              description: 'Text content side',
              children: [
                {
                  name: 'heading',
                  componentType: 'Text',
                  required: true,
                  allowsMultiple: false,
                  description: 'Hero heading'
                },
                {
                  name: 'description',
                  componentType: 'Text',
                  required: false,
                  allowsMultiple: false,
                  description: 'Hero description'
                },
                {
                  name: 'cta-buttons',
                  componentType: 'Container',
                  required: true,
                  allowsMultiple: false,
                  description: 'CTA buttons',
                  children: [
                    {
                      name: 'button',
                      componentType: 'Button',
                      required: true,
                      allowsMultiple: true,
                      description: 'CTA button(s)'
                    }
                  ]
                }
              ]
            },
            {
              name: 'image-content',
              componentType: 'Container',
              required: true,
              allowsMultiple: false,
              description: 'Image content side',
              children: [
                {
                  name: 'image',
                  componentType: 'Image',
                  required: true,
                  allowsMultiple: false,
                  description: 'Hero image'
                }
              ]
            }
          ]
        }
      ],
      usage: 'Use for hero sections with side-by-side text and image layout'
    };
  }

  private static getHeroCenteredSchema(): BlockSchema {
    return {
      blockType: 'Hero-Centered',
      category: BlockCategory.HERO,
      subType: BlockSubType.HERO_CENTERED,
      description: 'Centered hero section with vertical layout',
      wrapperComponent: 'section',
      importPath: '@/components/blocks/hero/hero-centered',
      tailwindClasses: ['w-full', 'py-12', 'md:py-24', 'lg:py-32', 'text-center'],
      structure: [
        {
          name: 'container',
          componentType: 'Container',
          required: true,
          allowsMultiple: false,
          description: 'Centered container',
          defaultProps: { className: 'flex flex-col items-center justify-center' },
          children: [
            {
              name: 'heading',
              componentType: 'Text',
              required: true,
              allowsMultiple: false,
              description: 'Centered heading'
            },
            {
              name: 'description',
              componentType: 'Text',
              required: false,
              allowsMultiple: false,
              description: 'Centered description'
            },
            {
              name: 'cta-buttons',
              componentType: 'Container',
              required: true,
              allowsMultiple: false,
              description: 'Centered CTA buttons',
              children: [
                {
                  name: 'button',
                  componentType: 'Button',
                  required: true,
                  allowsMultiple: true,
                  description: 'CTA button(s)'
                }
              ]
            }
          ]
        }
      ],
      usage: 'Use for centered hero sections with primary focus on text'
    };
  }

  // ============================================================================
  // FEATURE BLOCK SCHEMAS
  // ============================================================================

  private static getFeaturesGridSchema(): BlockSchema {
    return {
      blockType: 'Features-Grid',
      category: BlockCategory.FEATURES,
      subType: BlockSubType.FEATURES_GRID,
      description: 'Feature section with grid layout',
      wrapperComponent: 'section',
      importPath: '@/components/blocks/features/features-grid',
      tailwindClasses: ['w-full', 'py-12', 'md:py-24'],
      structure: [
        {
          name: 'container',
          componentType: 'Container',
          required: true,
          allowsMultiple: false,
          description: 'Section container',
          children: [
            {
              name: 'header',
              componentType: 'Container',
              required: false,
              allowsMultiple: false,
              description: 'Section header',
              children: [
                {
                  name: 'heading',
                  componentType: 'Text',
                  required: true,
                  allowsMultiple: false,
                  description: 'Section heading'
                },
                {
                  name: 'description',
                  componentType: 'Text',
                  required: false,
                  allowsMultiple: false,
                  description: 'Section description'
                }
              ]
            },
            {
              name: 'features-grid',
              componentType: 'Container',
              required: true,
              allowsMultiple: false,
              description: 'Feature cards grid',
              defaultProps: { className: 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' },
              children: [
                {
                  name: 'feature-card',
                  componentType: 'Card',
                  required: true,
                  allowsMultiple: true,
                  description: 'Individual feature card',
                  children: [
                    {
                      name: 'icon',
                      componentType: 'Icon',
                      required: false,
                      allowsMultiple: false,
                      description: 'Feature icon'
                    },
                    {
                      name: 'title',
                      componentType: 'Text',
                      required: true,
                      allowsMultiple: false,
                      description: 'Feature title'
                    },
                    {
                      name: 'description',
                      componentType: 'Text',
                      required: false,
                      allowsMultiple: false,
                      description: 'Feature description'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      usage: 'Use for showcasing multiple features in a grid layout'
    };
  }

  private static getFeaturesWithIconsSchema(): BlockSchema {
    return {
      blockType: 'Features-WithIcons',
      category: BlockCategory.FEATURES,
      subType: BlockSubType.FEATURES_WITH_ICONS,
      description: 'Feature section with prominent icons',
      wrapperComponent: 'section',
      importPath: '@/components/blocks/features/features-with-icons',
      tailwindClasses: ['w-full', 'py-12', 'md:py-24'],
      structure: [
        {
          name: 'container',
          componentType: 'Container',
          required: true,
          allowsMultiple: false,
          description: 'Section container',
          children: [
            {
              name: 'feature-list',
              componentType: 'Container',
              required: true,
              allowsMultiple: false,
              description: 'Feature items list',
              defaultProps: { className: 'space-y-8' },
              children: [
                {
                  name: 'feature-item',
                  componentType: 'Container',
                  required: true,
                  allowsMultiple: true,
                  description: 'Feature item with icon',
                  defaultProps: { className: 'flex gap-4' },
                  children: [
                    {
                      name: 'icon',
                      componentType: 'Icon',
                      required: true,
                      allowsMultiple: false,
                      description: 'Feature icon'
                    },
                    {
                      name: 'content',
                      componentType: 'Container',
                      required: true,
                      allowsMultiple: false,
                      description: 'Feature content',
                      children: [
                        {
                          name: 'title',
                          componentType: 'Text',
                          required: true,
                          allowsMultiple: false,
                          description: 'Feature title'
                        },
                        {
                          name: 'description',
                          componentType: 'Text',
                          required: false,
                          allowsMultiple: false,
                          description: 'Feature description'
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      usage: 'Use for feature lists with prominent icons'
    };
  }

  // ============================================================================
  // PRICING BLOCK SCHEMAS
  // ============================================================================

  private static getPricingCardsSchema(): BlockSchema {
    return {
      blockType: 'Pricing-Cards',
      category: BlockCategory.PRICING,
      subType: BlockSubType.PRICING_CARDS,
      description: 'Pricing section with card-based plans',
      wrapperComponent: 'section',
      importPath: '@/components/blocks/pricing/pricing-cards',
      tailwindClasses: ['w-full', 'py-12', 'md:py-24'],
      structure: [
        {
          name: 'container',
          componentType: 'Container',
          required: true,
          allowsMultiple: false,
          description: 'Pricing container',
          children: [
            {
              name: 'header',
              componentType: 'Container',
              required: false,
              allowsMultiple: false,
              description: 'Section header',
              children: [
                {
                  name: 'heading',
                  componentType: 'Text',
                  required: true,
                  allowsMultiple: false,
                  description: 'Pricing heading'
                }
              ]
            },
            {
              name: 'pricing-grid',
              componentType: 'Container',
              required: true,
              allowsMultiple: false,
              description: 'Pricing cards grid',
              defaultProps: { className: 'grid md:grid-cols-3 gap-8' },
              children: [
                {
                  name: 'pricing-card',
                  componentType: 'Card',
                  required: true,
                  allowsMultiple: true,
                  description: 'Individual pricing plan card',
                  children: [
                    {
                      name: 'badge',
                      componentType: 'Badge',
                      required: false,
                      allowsMultiple: false,
                      description: 'Plan badge (e.g., "Popular")'
                    },
                    {
                      name: 'plan-name',
                      componentType: 'Text',
                      required: true,
                      allowsMultiple: false,
                      description: 'Plan name'
                    },
                    {
                      name: 'price',
                      componentType: 'Text',
                      required: true,
                      allowsMultiple: false,
                      description: 'Plan price'
                    },
                    {
                      name: 'features-list',
                      componentType: 'Container',
                      required: true,
                      allowsMultiple: false,
                      description: 'Features list',
                      children: [
                        {
                          name: 'feature',
                          componentType: 'Text',
                          required: true,
                          allowsMultiple: true,
                          description: 'Feature item'
                        }
                      ]
                    },
                    {
                      name: 'cta-button',
                      componentType: 'Button',
                      required: true,
                      allowsMultiple: false,
                      description: 'Subscribe/Choose plan button'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      usage: 'Use for displaying pricing plans in card format'
    };
  }

  private static getPricingTableSchema(): BlockSchema {
    return {
      blockType: 'Pricing-Table',
      category: BlockCategory.PRICING,
      subType: BlockSubType.PRICING_TABLE,
      description: 'Pricing comparison table',
      wrapperComponent: 'section',
      importPath: '@/components/blocks/pricing/pricing-table',
      tailwindClasses: ['w-full', 'py-12', 'md:py-24'],
      structure: [
        {
          name: 'container',
          componentType: 'Container',
          required: true,
          allowsMultiple: false,
          description: 'Table container',
          children: [
            {
              name: 'table',
              componentType: 'Table',
              required: true,
              allowsMultiple: false,
              description: 'Pricing comparison table'
            }
          ]
        }
      ],
      usage: 'Use for detailed pricing comparisons with table format'
    };
  }

  // ============================================================================
  // AUTHENTICATION BLOCK SCHEMAS
  // ============================================================================

  private static getLoginFormSchema(): BlockSchema {
    return {
      blockType: 'Login-Form',
      category: BlockCategory.AUTHENTICATION,
      subType: BlockSubType.LOGIN,
      description: 'Login form with email/username and password',
      wrapperComponent: 'Card',
      importPath: '@/components/blocks/auth/login-form',
      tailwindClasses: ['w-full', 'max-w-md', 'mx-auto'],
      structure: [
        {
          name: 'card',
          componentType: 'Card',
          required: true,
          allowsMultiple: false,
          description: 'Form card wrapper',
          children: [
            {
              name: 'card-header',
              componentType: 'Container',
              required: false,
              allowsMultiple: false,
              description: 'Card header',
              children: [
                {
                  name: 'title',
                  componentType: 'Text',
                  required: true,
                  allowsMultiple: false,
                  description: 'Form title',
                  defaultProps: { as: 'h2' }
                },
                {
                  name: 'description',
                  componentType: 'Text',
                  required: false,
                  allowsMultiple: false,
                  description: 'Form description'
                }
              ]
            },
            {
              name: 'card-content',
              componentType: 'Container',
              required: true,
              allowsMultiple: false,
              description: 'Card content',
              children: [
                {
                  name: 'form',
                  componentType: 'Form',
                  required: true,
                  allowsMultiple: false,
                  description: 'Login form',
                  children: [
                    {
                      name: 'email-input',
                      componentType: 'Input',
                      required: true,
                      allowsMultiple: false,
                      description: 'Email/username input'
                    },
                    {
                      name: 'password-input',
                      componentType: 'Input',
                      required: true,
                      allowsMultiple: false,
                      description: 'Password input',
                      defaultProps: { type: 'password' }
                    },
                    {
                      name: 'remember-checkbox',
                      componentType: 'Checkbox',
                      required: false,
                      allowsMultiple: false,
                      description: 'Remember me checkbox'
                    },
                    {
                      name: 'submit-button',
                      componentType: 'Button',
                      required: true,
                      allowsMultiple: false,
                      description: 'Submit button',
                      defaultProps: { type: 'submit' }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      usage: 'Use for login/sign-in forms'
    };
  }

  private static getRegisterFormSchema(): BlockSchema {
    return {
      blockType: 'Register-Form',
      category: BlockCategory.AUTHENTICATION,
      subType: BlockSubType.REGISTER,
      description: 'Registration form with user details',
      wrapperComponent: 'Card',
      importPath: '@/components/blocks/auth/register-form',
      tailwindClasses: ['w-full', 'max-w-md', 'mx-auto'],
      structure: [
        {
          name: 'card',
          componentType: 'Card',
          required: true,
          allowsMultiple: false,
          description: 'Form card wrapper',
          children: [
            {
              name: 'card-header',
              componentType: 'Container',
              required: false,
              allowsMultiple: false,
              description: 'Card header',
              children: [
                {
                  name: 'title',
                  componentType: 'Text',
                  required: true,
                  allowsMultiple: false,
                  description: 'Form title'
                }
              ]
            },
            {
              name: 'card-content',
              componentType: 'Container',
              required: true,
              allowsMultiple: false,
              description: 'Card content',
              children: [
                {
                  name: 'form',
                  componentType: 'Form',
                  required: true,
                  allowsMultiple: false,
                  description: 'Registration form',
                  children: [
                    {
                      name: 'name-input',
                      componentType: 'Input',
                      required: false,
                      allowsMultiple: false,
                      description: 'Name input'
                    },
                    {
                      name: 'email-input',
                      componentType: 'Input',
                      required: true,
                      allowsMultiple: false,
                      description: 'Email input'
                    },
                    {
                      name: 'password-input',
                      componentType: 'Input',
                      required: true,
                      allowsMultiple: false,
                      description: 'Password input',
                      defaultProps: { type: 'password' }
                    },
                    {
                      name: 'confirm-password-input',
                      componentType: 'Input',
                      required: false,
                      allowsMultiple: false,
                      description: 'Confirm password input',
                      defaultProps: { type: 'password' }
                    },
                    {
                      name: 'terms-checkbox',
                      componentType: 'Checkbox',
                      required: false,
                      allowsMultiple: false,
                      description: 'Terms and conditions checkbox'
                    },
                    {
                      name: 'submit-button',
                      componentType: 'Button',
                      required: true,
                      allowsMultiple: false,
                      description: 'Submit button',
                      defaultProps: { type: 'submit' }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      usage: 'Use for registration/sign-up forms'
    };
  }

  private static getForgotPasswordSchema(): BlockSchema {
    return {
      blockType: 'Forgot-Password-Form',
      category: BlockCategory.AUTHENTICATION,
      subType: BlockSubType.FORGOT_PASSWORD,
      description: 'Password recovery form',
      wrapperComponent: 'Card',
      importPath: '@/components/blocks/auth/forgot-password-form',
      tailwindClasses: ['w-full', 'max-w-md', 'mx-auto'],
      structure: [
        {
          name: 'card',
          componentType: 'Card',
          required: true,
          allowsMultiple: false,
          description: 'Form card wrapper',
          children: [
            {
              name: 'card-header',
              componentType: 'Container',
              required: false,
              allowsMultiple: false,
              description: 'Card header',
              children: [
                {
                  name: 'title',
                  componentType: 'Text',
                  required: true,
                  allowsMultiple: false,
                  description: 'Form title'
                }
              ]
            },
            {
              name: 'card-content',
              componentType: 'Container',
              required: true,
              allowsMultiple: false,
              description: 'Card content',
              children: [
                {
                  name: 'form',
                  componentType: 'Form',
                  required: true,
                  allowsMultiple: false,
                  description: 'Password recovery form',
                  children: [
                    {
                      name: 'email-input',
                      componentType: 'Input',
                      required: true,
                      allowsMultiple: false,
                      description: 'Email input'
                    },
                    {
                      name: 'submit-button',
                      componentType: 'Button',
                      required: true,
                      allowsMultiple: false,
                      description: 'Submit button',
                      defaultProps: { type: 'submit' }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      usage: 'Use for password recovery/forgot password forms'
    };
  }

  // ============================================================================
  // DASHBOARD BLOCK SCHEMAS
  // ============================================================================

  private static getDashboardStatsSchema(): BlockSchema {
    return {
      blockType: 'Dashboard-Stats',
      category: BlockCategory.DASHBOARD,
      subType: BlockSubType.DASHBOARD_STATS,
      description: 'Dashboard statistics/metrics section',
      wrapperComponent: 'section',
      importPath: '@/components/blocks/dashboard/stats',
      tailwindClasses: ['w-full'],
      structure: [
        {
          name: 'stats-grid',
          componentType: 'Container',
          required: true,
          allowsMultiple: false,
          description: 'Stats cards grid',
          defaultProps: { className: 'grid md:grid-cols-2 lg:grid-cols-4 gap-4' },
          children: [
            {
              name: 'stat-card',
              componentType: 'Card',
              required: true,
              allowsMultiple: true,
              description: 'Individual stat card',
              children: [
                {
                  name: 'label',
                  componentType: 'Text',
                  required: true,
                  allowsMultiple: false,
                  description: 'Stat label'
                },
                {
                  name: 'value',
                  componentType: 'Text',
                  required: true,
                  allowsMultiple: false,
                  description: 'Stat value'
                },
                {
                  name: 'badge',
                  componentType: 'Badge',
                  required: false,
                  allowsMultiple: false,
                  description: 'Change indicator badge'
                },
                {
                  name: 'icon',
                  componentType: 'Icon',
                  required: false,
                  allowsMultiple: false,
                  description: 'Stat icon'
                }
              ]
            }
          ]
        }
      ],
      usage: 'Use for displaying dashboard metrics/KPIs'
    };
  }

  private static getDashboardHeaderSchema(): BlockSchema {
    return {
      blockType: 'Dashboard-Header',
      category: BlockCategory.DASHBOARD,
      subType: BlockSubType.DASHBOARD_HEADER,
      description: 'Dashboard page header with title and actions',
      wrapperComponent: 'header',
      importPath: '@/components/blocks/dashboard/header',
      tailwindClasses: ['w-full', 'py-6', 'border-b'],
      structure: [
        {
          name: 'container',
          componentType: 'Container',
          required: true,
          allowsMultiple: false,
          description: 'Header container',
          defaultProps: { className: 'flex items-center justify-between' },
          children: [
            {
              name: 'title-section',
              componentType: 'Container',
              required: true,
              allowsMultiple: false,
              description: 'Title section',
              children: [
                {
                  name: 'title',
                  componentType: 'Text',
                  required: true,
                  allowsMultiple: false,
                  description: 'Page title',
                  defaultProps: { as: 'h1' }
                },
                {
                  name: 'description',
                  componentType: 'Text',
                  required: false,
                  allowsMultiple: false,
                  description: 'Page description'
                }
              ]
            },
            {
              name: 'actions',
              componentType: 'Container',
              required: false,
              allowsMultiple: false,
              description: 'Action buttons',
              defaultProps: { className: 'flex gap-2' },
              children: [
                {
                  name: 'button',
                  componentType: 'Button',
                  required: false,
                  allowsMultiple: true,
                  description: 'Action button'
                }
              ]
            }
          ]
        }
      ],
      usage: 'Use for dashboard page headers'
    };
  }

  // ============================================================================
  // E-COMMERCE BLOCK SCHEMAS
  // ============================================================================

  private static getProductCardSchema(): BlockSchema {
    return {
      blockType: 'Product-Card',
      category: BlockCategory.ECOMMERCE,
      subType: BlockSubType.PRODUCT_CARD,
      description: 'Product card with image, title, price, and CTA',
      wrapperComponent: 'Card',
      importPath: '@/components/blocks/ecommerce/product-card',
      tailwindClasses: ['w-full'],
      structure: [
        {
          name: 'card',
          componentType: 'Card',
          required: true,
          allowsMultiple: false,
          description: 'Product card',
          children: [
            {
              name: 'image',
              componentType: 'Image',
              required: true,
              allowsMultiple: false,
              description: 'Product image'
            },
            {
              name: 'badge',
              componentType: 'Badge',
              required: false,
              allowsMultiple: false,
              description: 'Product badge (sale, new, etc.)'
            },
            {
              name: 'title',
              componentType: 'Text',
              required: true,
              allowsMultiple: false,
              description: 'Product title'
            },
            {
              name: 'description',
              componentType: 'Text',
              required: false,
              allowsMultiple: false,
              description: 'Product description'
            },
            {
              name: 'price',
              componentType: 'Text',
              required: true,
              allowsMultiple: false,
              description: 'Product price'
            },
            {
              name: 'cta-button',
              componentType: 'Button',
              required: true,
              allowsMultiple: false,
              description: 'Add to cart button'
            }
          ]
        }
      ],
      usage: 'Use for displaying individual products in a grid'
    };
  }

  private static getProductListSchema(): BlockSchema {
    return {
      blockType: 'Product-List',
      category: BlockCategory.ECOMMERCE,
      subType: BlockSubType.PRODUCT_LIST,
      description: 'Product listing grid',
      wrapperComponent: 'section',
      importPath: '@/components/blocks/ecommerce/product-list',
      tailwindClasses: ['w-full'],
      structure: [
        {
          name: 'container',
          componentType: 'Container',
          required: true,
          allowsMultiple: false,
          description: 'Products container',
          children: [
            {
              name: 'products-grid',
              componentType: 'Container',
              required: true,
              allowsMultiple: false,
              description: 'Products grid',
              defaultProps: { className: 'grid md:grid-cols-3 lg:grid-cols-4 gap-6' },
              children: [
                {
                  name: 'product-card',
                  componentType: 'Card',
                  required: true,
                  allowsMultiple: true,
                  description: 'Product card (see Product-Card schema)'
                }
              ]
            }
          ]
        }
      ],
      usage: 'Use for displaying multiple products in a grid layout'
    };
  }

  // ============================================================================
  // MARKETING BLOCK SCHEMAS
  // ============================================================================

  private static getTestimonialsSchema(): BlockSchema {
    return {
      blockType: 'Testimonials',
      category: BlockCategory.TESTIMONIALS,
      subType: BlockSubType.UNKNOWN,
      description: 'Testimonials/reviews section',
      wrapperComponent: 'section',
      importPath: '@/components/blocks/marketing/testimonials',
      tailwindClasses: ['w-full', 'py-12', 'md:py-24'],
      structure: [
        {
          name: 'container',
          componentType: 'Container',
          required: true,
          allowsMultiple: false,
          description: 'Testimonials container',
          children: [
            {
              name: 'header',
              componentType: 'Container',
              required: false,
              allowsMultiple: false,
              description: 'Section header',
              children: [
                {
                  name: 'heading',
                  componentType: 'Text',
                  required: true,
                  allowsMultiple: false,
                  description: 'Section heading'
                }
              ]
            },
            {
              name: 'testimonials-grid',
              componentType: 'Container',
              required: true,
              allowsMultiple: false,
              description: 'Testimonials grid',
              defaultProps: { className: 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' },
              children: [
                {
                  name: 'testimonial-card',
                  componentType: 'Card',
                  required: true,
                  allowsMultiple: true,
                  description: 'Individual testimonial',
                  children: [
                    {
                      name: 'quote',
                      componentType: 'Text',
                      required: true,
                      allowsMultiple: false,
                      description: 'Testimonial quote'
                    },
                    {
                      name: 'author',
                      componentType: 'Container',
                      required: true,
                      allowsMultiple: false,
                      description: 'Author information',
                      children: [
                        {
                          name: 'avatar',
                          componentType: 'Avatar',
                          required: false,
                          allowsMultiple: false,
                          description: 'Author avatar'
                        },
                        {
                          name: 'name',
                          componentType: 'Text',
                          required: true,
                          allowsMultiple: false,
                          description: 'Author name'
                        },
                        {
                          name: 'role',
                          componentType: 'Text',
                          required: false,
                          allowsMultiple: false,
                          description: 'Author role/company'
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      usage: 'Use for displaying customer testimonials/reviews'
    };
  }

  private static getCTASchema(): BlockSchema {
    return {
      blockType: 'CTA',
      category: BlockCategory.CTA,
      subType: BlockSubType.UNKNOWN,
      description: 'Call-to-action section',
      wrapperComponent: 'section',
      importPath: '@/components/blocks/marketing/cta',
      tailwindClasses: ['w-full', 'py-12', 'md:py-24', 'text-center'],
      structure: [
        {
          name: 'container',
          componentType: 'Container',
          required: true,
          allowsMultiple: false,
          description: 'CTA container',
          defaultProps: { className: 'flex flex-col items-center justify-center' },
          children: [
            {
              name: 'heading',
              componentType: 'Text',
              required: true,
              allowsMultiple: false,
              description: 'CTA heading'
            },
            {
              name: 'description',
              componentType: 'Text',
              required: false,
              allowsMultiple: false,
              description: 'CTA description'
            },
            {
              name: 'buttons',
              componentType: 'Container',
              required: true,
              allowsMultiple: false,
              description: 'CTA buttons',
              defaultProps: { className: 'flex gap-4' },
              children: [
                {
                  name: 'button',
                  componentType: 'Button',
                  required: true,
                  allowsMultiple: true,
                  description: 'CTA button(s)'
                }
              ]
            }
          ]
        }
      ],
      usage: 'Use for call-to-action sections'
    };
  }

  private static getFooterSchema(): BlockSchema {
    return {
      blockType: 'Footer',
      category: BlockCategory.FOOTER,
      subType: BlockSubType.UNKNOWN,
      description: 'Site footer with navigation and links',
      wrapperComponent: 'footer',
      importPath: '@/components/blocks/marketing/footer',
      tailwindClasses: ['w-full', 'py-12', 'border-t'],
      structure: [
        {
          name: 'container',
          componentType: 'Container',
          required: true,
          allowsMultiple: false,
          description: 'Footer container',
          children: [
            {
              name: 'columns',
              componentType: 'Container',
              required: true,
              allowsMultiple: false,
              description: 'Footer columns',
              defaultProps: { className: 'grid md:grid-cols-4 gap-8' },
              children: [
                {
                  name: 'column',
                  componentType: 'Container',
                  required: true,
                  allowsMultiple: true,
                  description: 'Footer column',
                  children: [
                    {
                      name: 'heading',
                      componentType: 'Text',
                      required: true,
                      allowsMultiple: false,
                      description: 'Column heading'
                    },
                    {
                      name: 'links',
                      componentType: 'Container',
                      required: true,
                      allowsMultiple: false,
                      description: 'Links list',
                      children: [
                        {
                          name: 'link',
                          componentType: 'Text',
                          required: true,
                          allowsMultiple: true,
                          description: 'Footer link'
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              name: 'bottom',
              componentType: 'Container',
              required: false,
              allowsMultiple: false,
              description: 'Footer bottom (copyright, social)',
              children: [
                {
                  name: 'copyright',
                  componentType: 'Text',
                  required: false,
                  allowsMultiple: false,
                  description: 'Copyright text'
                },
                {
                  name: 'social-icons',
                  componentType: 'Container',
                  required: false,
                  allowsMultiple: false,
                  description: 'Social media icons',
                  children: [
                    {
                      name: 'icon',
                      componentType: 'Icon',
                      required: true,
                      allowsMultiple: true,
                      description: 'Social icon'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      usage: 'Use for site footer'
    };
  }

  private static getHeaderSchema(): BlockSchema {
    return {
      blockType: 'Header',
      category: BlockCategory.HEADER,
      subType: BlockSubType.UNKNOWN,
      description: 'Site header/navigation',
      wrapperComponent: 'header',
      importPath: '@/components/blocks/marketing/header',
      tailwindClasses: ['w-full', 'py-4', 'border-b'],
      structure: [
        {
          name: 'container',
          componentType: 'Container',
          required: true,
          allowsMultiple: false,
          description: 'Header container',
          defaultProps: { className: 'flex items-center justify-between' },
          children: [
            {
              name: 'logo',
              componentType: 'Container',
              required: true,
              allowsMultiple: false,
              description: 'Logo/brand',
              children: [
                {
                  name: 'image',
                  componentType: 'Image',
                  required: false,
                  allowsMultiple: false,
                  description: 'Logo image'
                },
                {
                  name: 'text',
                  componentType: 'Text',
                  required: false,
                  allowsMultiple: false,
                  description: 'Brand text'
                }
              ]
            },
            {
              name: 'navigation',
              componentType: 'Container',
              required: true,
              allowsMultiple: false,
              description: 'Navigation menu',
              children: [
                {
                  name: 'nav-item',
                  componentType: 'Text',
                  required: true,
                  allowsMultiple: true,
                  description: 'Navigation link'
                }
              ]
            },
            {
              name: 'actions',
              componentType: 'Container',
              required: false,
              allowsMultiple: false,
              description: 'Action buttons',
              children: [
                {
                  name: 'button',
                  componentType: 'Button',
                  required: false,
                  allowsMultiple: true,
                  description: 'Action button'
                },
                {
                  name: 'avatar',
                  componentType: 'Avatar',
                  required: false,
                  allowsMultiple: false,
                  description: 'User avatar'
                }
              ]
            }
          ]
        }
      ],
      usage: 'Use for site header/navigation bar'
    };
  }

  // ============================================================================
  // CONTENT BLOCK SCHEMAS
  // ============================================================================

  private static getBlogCardSchema(): BlockSchema {
    return {
      blockType: 'Blog-Card',
      category: BlockCategory.BLOG,
      subType: BlockSubType.BLOG_CARD,
      description: 'Blog post card',
      wrapperComponent: 'Card',
      importPath: '@/components/blocks/content/blog-card',
      tailwindClasses: ['w-full'],
      structure: [
        {
          name: 'card',
          componentType: 'Card',
          required: true,
          allowsMultiple: false,
          description: 'Blog card',
          children: [
            {
              name: 'image',
              componentType: 'Image',
              required: true,
              allowsMultiple: false,
              description: 'Blog post image'
            },
            {
              name: 'badge',
              componentType: 'Badge',
              required: false,
              allowsMultiple: true,
              description: 'Category badge'
            },
            {
              name: 'title',
              componentType: 'Text',
              required: true,
              allowsMultiple: false,
              description: 'Blog post title'
            },
            {
              name: 'excerpt',
              componentType: 'Text',
              required: false,
              allowsMultiple: false,
              description: 'Blog post excerpt'
            },
            {
              name: 'meta',
              componentType: 'Container',
              required: false,
              allowsMultiple: false,
              description: 'Post meta (date, author)',
              children: [
                {
                  name: 'avatar',
                  componentType: 'Avatar',
                  required: false,
                  allowsMultiple: false,
                  description: 'Author avatar'
                },
                {
                  name: 'author',
                  componentType: 'Text',
                  required: false,
                  allowsMultiple: false,
                  description: 'Author name'
                },
                {
                  name: 'date',
                  componentType: 'Text',
                  required: false,
                  allowsMultiple: false,
                  description: 'Publication date'
                }
              ]
            }
          ]
        }
      ],
      usage: 'Use for displaying blog posts in a grid'
    };
  }
}

// Initialize schemas on module load
BlockSchemaRegistry.initialize();
